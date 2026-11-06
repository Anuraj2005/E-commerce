const InstagramPost = require('../models/InstagramPost');
const { isDbConnected } = require('../config/db');
const devStore = require('../services/devMemoryStore');

exports.getInstagramFeed = async (_req, res, next) => {
  try {
    if (isDbConnected()) {
      const posts = await InstagramPost.find({ isActive: true })
        .populate({
          path: 'products',
          populate: { path: 'category', select: 'name slug' },
        })
        .sort({ displayOrder: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: posts.length,
        posts,
      });
    }

    devStore.init();
    const posts = devStore.instagramPosts
      .filter((p) => p.isActive !== false)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((post) => ({
        ...post,
        // Refresh product snapshots from live memory store so stock is always accurate
        products: (post.products || []).map(
          (linked) =>
            devStore.products.find((p) => String(p._id) === String(linked._id)) || linked
        ),
      }));

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (err) {
    next(err);
  }
};
