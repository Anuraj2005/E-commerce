const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { isDbConnected } = require('../config/db');
const devStore = require('../services/devMemoryStore');
const { triggerRevalidation } = require('../services/revalidateService');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      subCategory,
      badge,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort = 'featured',
      page = 1,
      limit = 24,
      includeInactive,
    } = req.query;

    const isAdminView =
      includeInactive === 'true' &&
      req.user &&
      ['admin', 'staff'].includes(req.user.role);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));

    if (isDbConnected()) {
      const filter = {};
      if (!isAdminView) {
        filter.isActive = true;
      }

      if (category && category !== 'all') {
        if (mongoose.Types.ObjectId.isValid(category)) {
          filter.category = category;
        } else {
          const catDoc = await Category.findOne({ slug: String(category).toLowerCase() }).lean();
          if (catDoc) {
            filter.category = catDoc._id;
          } else {
            return res.status(200).json({
              success: true,
              count: 0,
              total: 0,
              page: pageNum,
              pages: 0,
              products: [],
            });
          }
        }
      }

      if (subCategory) {
        filter.subCategory = subCategory;
      }

      if (badge) {
        filter.badges = String(badge).toUpperCase();
      }

      if (inStock === 'true') {
        filter.stock = { $gt: 0 };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
      }

      if (search && String(search).trim()) {
        const escaped = String(search)
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        filter.$or = [{ title: regex }, { description: regex }, { subCategory: regex }];
      }

      let sortSpec = { createdAt: -1 };
      if (sort === 'price-asc') sortSpec = { price: 1 };
      else if (sort === 'price-desc') sortSpec = { price: -1 };
      else if (sort === 'rating') sortSpec = { 'ratings.average': -1, 'ratings.count': -1 };
      else if (sort === 'newest') sortSpec = { createdAt: -1 };

      const [total, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter)
          .populate('category', 'name slug')
          .sort(sortSpec)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
      ]);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        products,
      });
    }

    // Dev fallback store
    devStore.init();
    let list = [...devStore.products];

    if (!isAdminView) {
      list = list.filter((p) => p.isActive !== false);
    }

    if (category && category !== 'all') {
      const target = String(category).toLowerCase();
      list = list.filter(
        (p) =>
          String(p.category?._id || p.category) === category ||
          String(p.category?.slug || '').toLowerCase() === target
      );
    }

    if (subCategory) {
      list = list.filter((p) => p.subCategory === subCategory);
    }

    if (badge) {
      const b = String(badge).toUpperCase();
      list = list.filter((p) => Array.isArray(p.badges) && p.badges.includes(b));
    }

    if (inStock === 'true') {
      list = list.filter((p) => p.stock > 0);
    }

    if (minPrice !== undefined && minPrice !== '') {
      list = list.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      list = list.filter((p) => p.price <= Number(maxPrice));
    }

    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: paginated,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      const query = mongoose.Types.ObjectId.isValid(slug)
        ? { $or: [{ slug: slug.toLowerCase() }, { _id: slug }] }
        : { slug: slug.toLowerCase() };

      const product = await Product.findOne(query).populate('category', 'name slug').lean();
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        isActive: true,
        $or: [{ category: product.category?._id || product.category }, { subCategory: product.subCategory }],
      })
        .populate('category', 'name slug')
        .limit(4)
        .lean();

      return res.status(200).json({
        success: true,
        product,
        relatedProducts,
      });
    }

    devStore.init();
    const product = devStore.products.find(
      (p) => p.slug === slug.toLowerCase() || String(p._id) === slug
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const relatedProducts = devStore.products
      .filter(
        (p) =>
          p._id !== product._id &&
          p.isActive !== false &&
          (p.category?.slug === product.category?.slug || p.subCategory === product.subCategory)
      )
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.title || payload.price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product title and price are required.',
      });
    }

    payload.slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);
    const io = req.app.get('io');

    if (isDbConnected()) {
      // Allow category slug or ObjectId
      if (payload.category && !mongoose.Types.ObjectId.isValid(payload.category)) {
        const cat = await Category.findOne({ slug: String(payload.category).toLowerCase() });
        if (cat) payload.category = cat._id;
      }

      const existingSlug = await Product.findOne({ slug: payload.slug });
      if (existingSlug) {
        payload.slug = `${payload.slug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const created = await Product.create(payload);
      const populated = await Product.findById(created._id)
        .populate('category', 'name slug')
        .lean();

      if (io) {
        io.emit('product:updated', { action: 'CREATE', product: populated });
      }
      triggerRevalidation(['/', `/products/${populated.slug}`, `/collections/${populated.category?.slug || 'all'}`]);

      return res.status(201).json({
        success: true,
        product: populated,
      });
    }

    devStore.init();
    if (devStore.products.some((p) => p.slug === payload.slug)) {
      payload.slug = `${payload.slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const matchedCat =
      devStore.categories.find(
        (c) => String(c._id) === String(payload.category) || c.slug === payload.category
      ) || devStore.categories[0];

    const now = new Date().toISOString();
    const newProduct = {
      _id: devStore.makeId(),
      title: payload.title,
      slug: payload.slug,
      description: payload.description || '',
      price: Number(payload.price),
      compareAtPrice: payload.compareAtPrice ? Number(payload.compareAtPrice) : null,
      stock: Number(payload.stock ?? 0),
      images:
        Array.isArray(payload.images) && payload.images.length > 0
          ? payload.images
          : [
              {
                url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85',
                public_id: 'artistic_fusion/products/default',
                isPrimary: true,
              },
            ],
      videoUrl: payload.videoUrl || null,
      category: { _id: matchedCat._id, name: matchedCat.name, slug: matchedCat.slug },
      subCategory: payload.subCategory || 'Gift Hampers',
      leadTimeDays: Number(payload.leadTimeDays || 2),
      inclusions: payload.inclusions || [
        'Handcrafted signature keepsake presentation box',
        'Satin ribbon bow & botanical wax seal',
      ],
      dimensions:
        payload.dimensions || '28 cm × 24 cm × 12 cm · Protective multi-layer transit cushioning',
      careInstructions:
        payload.careInstructions ||
        'Store in a cool, dry indoor space away from direct moisture and harsh sunlight.',
      isCustomizable: Boolean(payload.isCustomizable),
      customizationOptions: payload.customizationOptions || {
        allowCustomTag: true,
        defaultTags: ['Just for you', 'Happy Birthday', 'With Love', 'Congratulations'],
        ribbonColors: ['Crimson Red', 'Blush Rose', 'Royal Gold', 'Ivory'],
        requiresPhotoUpload: false,
        maxPhotosAllowed: 0,
      },
      ratings: payload.ratings || { average: 5.0, count: 1 },
      badges: payload.badges || ['NEW'],
      isActive: payload.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };

    devStore.products.unshift(newProduct);
    if (io) {
      io.emit('product:updated', { action: 'CREATE', product: newProduct });
    }
    triggerRevalidation(['/', `/products/${newProduct.slug}`]);

    return res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates._id;
    const io = req.app.get('io');

    if (isDbConnected()) {
      if (updates.category && typeof updates.category === 'object' && updates.category._id) {
        updates.category = updates.category._id;
      }

      const updated = await Product.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      })
        .populate('category', 'name slug')
        .lean();

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (io) {
        io.emit('product:updated', { action: 'UPDATE', product: updated });
      }
      triggerRevalidation(['/', `/products/${updated.slug}`, `/collections/${updated.category?.slug || 'all'}`]);

      return res.status(200).json({
        success: true,
        product: updated,
      });
    }

    devStore.init();
    const idx = devStore.products.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (updates.category && typeof updates.category === 'string') {
      const cat = devStore.categories.find(
        (c) => String(c._id) === updates.category || c.slug === updates.category
      );
      if (cat) {
        updates.category = { _id: cat._id, name: cat.name, slug: cat.slug };
      }
    }

    const updatedProduct = {
      ...devStore.products[idx],
      ...updates,
      ...(updates.price !== undefined && { price: Number(updates.price) }),
      ...(updates.stock !== undefined && { stock: Math.max(0, Number(updates.stock)) }),
      updatedAt: new Date().toISOString(),
    };
    devStore.products[idx] = updatedProduct;

    if (io) {
      io.emit('product:updated', { action: 'UPDATE', product: updatedProduct });
    }
    triggerRevalidation(['/', `/products/${updatedProduct.slug}`]);

    return res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');

    if (isDbConnected()) {
      const updated = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      )
        .populate('category', 'name slug')
        .lean();

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (io) {
        io.emit('product:updated', { action: 'DELETE', product: updated });
      }
      triggerRevalidation(['/', `/products/${updated.slug}`]);

      return res.status(200).json({
        success: true,
        message: 'Product archived successfully.',
        product: updated,
      });
    }

    devStore.init();
    const idx = devStore.products.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    devStore.products[idx].isActive = false;
    const archived = devStore.products[idx];

    if (io) {
      io.emit('product:updated', { action: 'DELETE', product: archived });
    }

    return res.status(200).json({
      success: true,
      message: 'Product archived successfully.',
      product: archived,
    });
  } catch (err) {
    next(err);
  }
};
