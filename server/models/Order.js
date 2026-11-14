const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    customization: {
      selectedTag: { type: String, default: '' },
      selectedRibbon: { type: String, default: '' },
      customNote: { type: String, default: '' },
      customerUploadedPhotos: [{ type: String }],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    items: [orderItemSchema],
    giftMessage: {
      type: String,
      default: '',
    },
    addGiftCardUpsell: {
      type: Boolean,
      default: false,
    },
    couponCode: {
      type: String,
      default: null,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      giftWrapFee: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'MOCK_ONLINE', 'RAZORPAY'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    fulfillmentStatus: {
      type: String,
      enum: ['RECEIVED', 'HANDCRAFTING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'RECEIVED',
      index: true,
    },
    trackingCode: { type: String, default: null },
    requestedDeliveryDate: { type: String, default: '' },
    estimatedDeliveryWindow: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
