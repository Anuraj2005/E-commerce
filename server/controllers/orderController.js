const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { isDbConnected } = require('../config/db');
const devStore = require('../services/devMemoryStore');

const FREE_SHIPPING_THRESHOLD = 1999;
const STANDARD_SHIPPING_FEE = 99;
const GIFT_CARD_UPSELL_FEE = 99;

function generateOrderNumber() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `AF-${randomDigits}`;
}

exports.createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      shippingAddress,
      items,
      giftMessage = '',
      addGiftCardUpsell = false,
      couponCode = '',
      requestedDeliveryDate = '',
      estimatedDeliveryWindow = '',
      paymentMethod = 'COD',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping bag is empty.',
      });
    }

    if (
      !shippingAddress?.addressLine ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !/^[1-9][0-9]{5}$/.test(String(shippingAddress?.pincode || '').trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address and valid 6-digit Indian pincode.',
      });
    }

    const customerInfo = {
      name: String(customer?.name || req.user?.name || '').trim(),
      email: String(customer?.email || req.user?.email || '').trim().toLowerCase(),
      phone: String(customer?.phone || req.user?.phone || '').trim(),
    };

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and 10-digit mobile number are required.',
      });
    }

    const io = req.app.get('io');
    const normalizedCoupon = String(couponCode || '').trim().toUpperCase();

    if (isDbConnected()) {
      // 1. Verify products & stock first
      const resolvedItems = [];
      let subtotal = 0;

      for (const reqItem of items) {
        const qty = Math.max(1, Number(reqItem.quantity) || 1);
        const productDoc = await Product.findById(reqItem.product);
        if (!productDoc || !productDoc.isActive) {
          return res.status(400).json({
            success: false,
            message: `Item "${reqItem.title || 'Selected craft'}" is no longer available.`,
          });
        }
        if (productDoc.stock < qty) {
          return res.status(400).json({
            success: false,
            message:
              productDoc.stock === 0
                ? `"${productDoc.title}" just sold out.`
                : `Only ${productDoc.stock} left in stock for "${productDoc.title}".`,
          });
        }

        subtotal += productDoc.price * qty;
        resolvedItems.push({
          productDoc,
          orderLine: {
            product: productDoc._id,
            title: productDoc.title,
            slug: productDoc.slug,
            price: productDoc.price,
            quantity: qty,
            image: reqItem.image || productDoc.images[0]?.url || '',
            customization: {
              selectedTag: reqItem.customization?.selectedTag || '',
              selectedRibbon: reqItem.customization?.selectedRibbon || '',
              customNote: reqItem.customization?.customNote || '',
              customerUploadedPhotos: Array.isArray(
                reqItem.customization?.customerUploadedPhotos
              )
                ? reqItem.customization.customerUploadedPhotos
                : [],
            },
          },
        });
      }

      // 2. Atomically decrement stock and collect updated docs
      const updatedProducts = [];
      for (const entry of resolvedItems) {
        const decremented = await Product.findOneAndUpdate(
          { _id: entry.productDoc._id, stock: { $gte: entry.orderLine.quantity } },
          { $inc: { stock: -entry.orderLine.quantity } },
          { new: true }
        )
          .populate('category', 'name slug')
          .lean();

        if (!decremented) {
          return res.status(409).json({
            success: false,
            message: `Stock changed while placing order for "${entry.productDoc.title}". Please try again.`,
          });
        }
        updatedProducts.push(decremented);
      }

      const discount = normalizedCoupon === 'HANDMADE10' ? Math.round(subtotal * 0.1) : 0;
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
      const giftWrapFee = addGiftCardUpsell ? GIFT_CARD_UPSELL_FEE : 0;
      const taxableAmount = Math.max(0, subtotal - discount);
      const gstAmount = Math.round((taxableAmount * 0.12) / 1.12);
      const total = taxableAmount + shippingFee + giftWrapFee;

      const createdOrder = await Order.create({
        orderNumber: generateOrderNumber(),
        user: req.user?._id || null,
        customer: customerInfo,
        shippingAddress: {
          addressLine: String(shippingAddress.addressLine).trim(),
          city: String(shippingAddress.city).trim(),
          state: String(shippingAddress.state).trim(),
          pincode: String(shippingAddress.pincode).trim(),
        },
        items: resolvedItems.map((e) => e.orderLine),
        giftMessage: String(giftMessage || '').trim(),
        addGiftCardUpsell: Boolean(addGiftCardUpsell),
        couponCode: discount > 0 ? normalizedCoupon : null,
        requestedDeliveryDate: String(requestedDeliveryDate || '').trim(),
        estimatedDeliveryWindow: String(estimatedDeliveryWindow || '').trim(),
        pricing: {
          subtotal,
          shippingFee,
          giftWrapFee,
          gstAmount,
          discount,
          total,
        },
        paymentMethod: ['COD', 'MOCK_ONLINE', 'RAZORPAY'].includes(paymentMethod)
          ? paymentMethod
          : 'COD',
        paymentStatus: paymentMethod === 'MOCK_ONLINE' ? 'PAID' : 'PENDING',
        fulfillmentStatus: 'RECEIVED',
      });

      // Persist address & phone to user account for future 1-click checkouts
      if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
          phone: customerInfo.phone,
          savedAddress: {
            addressLine: String(shippingAddress.addressLine).trim(),
            city: String(shippingAddress.city).trim(),
            state: String(shippingAddress.state).trim(),
            pincode: String(shippingAddress.pincode).trim(),
          },
        }).catch(() => null);
      }

      // Broadcast real-time stock reductions & new order to Admin Portal
      if (io) {
        updatedProducts.forEach((p) => {
          io.emit('product:updated', { action: 'UPDATE', product: p });
        });
        io.emit('order:created', { order: createdOrder });
      }

      return res.status(201).json({
        success: true,
        order: createdOrder,
      });
    }

    // Dev fallback store
    devStore.init();
    let subtotal = 0;
    const orderItems = [];
    const touchedProducts = [];

    for (const reqItem of items) {
      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      const prodIdx = devStore.products.findIndex(
        (p) => String(p._id) === String(reqItem.product) || p.slug === reqItem.slug
      );

      if (prodIdx === -1 || devStore.products[prodIdx].isActive === false) {
        return res.status(400).json({
          success: false,
          message: `Item "${reqItem.title || 'Selected craft'}" is no longer available.`,
        });
      }

      const prod = devStore.products[prodIdx];
      if (prod.stock < qty) {
        return res.status(400).json({
          success: false,
          message:
            prod.stock === 0
              ? `"${prod.title}" just sold out.`
              : `Only ${prod.stock} left in stock for "${prod.title}".`,
        });
      }

      subtotal += prod.price * qty;
      touchedProducts.push({ prodIdx, qty });
      orderItems.push({
        product: prod._id,
        title: prod.title,
        slug: prod.slug,
        price: prod.price,
        quantity: qty,
        image: reqItem.image || prod.images[0]?.url || '',
        customization: {
          selectedTag: reqItem.customization?.selectedTag || '',
          selectedRibbon: reqItem.customization?.selectedRibbon || '',
          customNote: reqItem.customization?.customNote || '',
          customerUploadedPhotos: Array.isArray(reqItem.customization?.customerUploadedPhotos)
            ? reqItem.customization.customerUploadedPhotos
            : [],
        },
      });
    }

    // Deduct stock in memory store
    const updatedMemProducts = touchedProducts.map(({ prodIdx, qty }) => {
      devStore.products[prodIdx] = {
        ...devStore.products[prodIdx],
        stock: Math.max(0, devStore.products[prodIdx].stock - qty),
        updatedAt: new Date().toISOString(),
      };
      return devStore.products[prodIdx];
    });

    const discount = normalizedCoupon === 'HANDMADE10' ? Math.round(subtotal * 0.1) : 0;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const giftWrapFee = addGiftCardUpsell ? GIFT_CARD_UPSELL_FEE : 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const gstAmount = Math.round((taxableAmount * 0.12) / 1.12);
    const total = taxableAmount + shippingFee + giftWrapFee;

    const now = new Date().toISOString();
    const newOrder = {
      _id: devStore.makeId(),
      orderNumber: generateOrderNumber(),
      user: req.user?._id || null,
      customer: customerInfo,
      shippingAddress: {
        addressLine: String(shippingAddress.addressLine).trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state).trim(),
        pincode: String(shippingAddress.pincode).trim(),
      },
      items: orderItems,
      giftMessage: String(giftMessage || '').trim(),
      addGiftCardUpsell: Boolean(addGiftCardUpsell),
      couponCode: discount > 0 ? normalizedCoupon : null,
      requestedDeliveryDate: String(requestedDeliveryDate || '').trim(),
      estimatedDeliveryWindow: String(estimatedDeliveryWindow || '').trim(),
      pricing: {
        subtotal,
        shippingFee,
        giftWrapFee,
        gstAmount,
        discount,
        total,
      },
      paymentMethod: ['COD', 'MOCK_ONLINE', 'RAZORPAY'].includes(paymentMethod)
        ? paymentMethod
        : 'COD',
      paymentStatus: paymentMethod === 'MOCK_ONLINE' ? 'PAID' : 'PENDING',
      fulfillmentStatus: 'RECEIVED',
      trackingCode: null,
      createdAt: now,
      updatedAt: now,
    };

    devStore.orders.unshift(newOrder);

    if (req.user?._id) {
      const uIdx = devStore.users.findIndex((u) => String(u._id) === String(req.user._id));
      if (uIdx !== -1) {
        devStore.users[uIdx].phone = customerInfo.phone;
        devStore.users[uIdx].savedAddress = newOrder.shippingAddress;
      }
    }

    if (io) {
      updatedMemProducts.forEach((p) => {
        io.emit('product:updated', { action: 'UPDATE', product: p });
      });
      io.emit('order:created', { order: newOrder });
    }

    return res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const mongoose = require('mongoose');
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { orderNumber: id.toUpperCase() }] }
        : { orderNumber: id.toUpperCase() };

      const order = await Order.findOne(query).lean();
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const isAdminOrStaff = ['admin', 'staff'].includes(req.user?.role);
      const isOwner =
        (order.user && String(order.user) === String(req.user?._id)) ||
        order.customer?.email === req.user?.email;

      if (!isAdminOrStaff && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order.',
        });
      }

      return res.status(200).json({
        success: true,
        order,
      });
    }

    devStore.init();
    const order = devStore.orders.find(
      (o) => String(o._id) === String(id) || o.orderNumber === id.toUpperCase()
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const isAdminOrStaff = ['admin', 'staff'].includes(req.user?.role);
    const isOwner =
      (order.user && String(order.user) === String(req.user?._id)) ||
      order.customer?.email === req.user?.email;

    if (!isAdminOrStaff && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const orders = await Order.find({
        $or: [{ user: req.user._id }, { 'customer.email': req.user.email }],
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    }

    devStore.init();
    const orders = devStore.orders.filter(
      (o) =>
        String(o.user) === String(req.user._id) || o.customer?.email === req.user.email
    );

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (status && status !== 'ALL') {
        filter.fulfillmentStatus = String(status).toUpperCase();
      }
      const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    }

    devStore.init();
    let orders = [...devStore.orders];
    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.fulfillmentStatus === String(status).toUpperCase());
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fulfillmentStatus, paymentStatus, trackingCode } = req.body;
    const io = req.app.get('io');

    const validStatuses = [
      'RECEIVED',
      'HANDCRAFTING',
      'PACKED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

    if (fulfillmentStatus && !validStatuses.includes(fulfillmentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid fulfillment status: ${fulfillmentStatus}`,
      });
    }

    const updateFields = {};
    if (fulfillmentStatus) updateFields.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (trackingCode !== undefined) updateFields.trackingCode = trackingCode;

    // Auto-mark COD order as PAID upon DELIVERED
    if (fulfillmentStatus === 'DELIVERED' && !paymentStatus) {
      updateFields.paymentStatus = 'PAID';
    }

    if (isDbConnected()) {
      const updated = await Order.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      if (io) {
        io.emit('order:updated', { order: updated });
      }

      return res.status(200).json({
        success: true,
        order: updated,
      });
    }

    devStore.init();
    const idx = devStore.orders.findIndex(
      (o) => String(o._id) === String(id) || o.orderNumber === id
    );
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    devStore.orders[idx] = {
      ...devStore.orders[idx],
      ...updateFields,
      updatedAt: new Date().toISOString(),
    };

    const updatedOrder = devStore.orders[idx];
    if (io) {
      io.emit('order:updated', { order: updatedOrder });
    }

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};
