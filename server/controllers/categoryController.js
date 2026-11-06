const Category = require('../models/Category');
const { isDbConnected } = require('../config/db');
const devStore = require('../services/devMemoryStore');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

exports.getCategories = async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      const categories = await Category.find({ isActive: true })
        .sort({ displayOrder: 1, name: 1 })
        .lean();
      return res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      });
    }

    devStore.init();
    const categories = devStore.categories
      .filter((c) => c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, highlightCoverImage, displayOrder } = req.body;
    if (!name || !highlightCoverImage?.url) {
      return res.status(400).json({
        success: false,
        message: 'Category name and highlightCoverImage.url are required.',
      });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    if (isDbConnected()) {
      const category = await Category.create({
        name,
        slug: finalSlug,
        description: description || '',
        highlightCoverImage: {
          url: highlightCoverImage.url,
          public_id: highlightCoverImage.public_id || `artistic_fusion/highlights/${finalSlug}`,
        },
        displayOrder: Number(displayOrder) || 0,
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        category,
      });
    }

    devStore.init();
    const category = {
      _id: devStore.makeId(),
      name,
      slug: finalSlug,
      description: description || '',
      highlightCoverImage: {
        url: highlightCoverImage.url,
        public_id: highlightCoverImage.public_id || `artistic_fusion/highlights/${finalSlug}`,
      },
      displayOrder: Number(displayOrder) || devStore.categories.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    devStore.categories.push(category);

    return res.status(201).json({
      success: true,
      category,
    });
  } catch (err) {
    next(err);
  }
};
