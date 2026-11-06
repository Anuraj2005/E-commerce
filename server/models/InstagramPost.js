const mongoose = require('mongoose');

const instagramPostSchema = new mongoose.Schema(
  {
    caption: { type: String, required: true },
    handle: { type: String, default: '@artisticfusion.in' },
    imageUrl: { type: String, required: true },
    isReel: { type: Boolean, default: false },
    likesCount: { type: Number, default: 280 },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InstagramPost', instagramPostSchema);
