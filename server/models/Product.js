const mongoose = require('mongoose');

const imageSubSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: {
      type: [imageSubSchema],
      validate: [(arr) => arr.length > 0, 'At least one product image is required'],
    },
    videoUrl: {
      type: String,
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      enum: [
        'Gift Hampers',
        'Celebration Hampers',
        'Albums',
        'Bouquets',
        'A5 Frames',
        'Invitation Cards',
        'Event Décor',
      ],
      required: true,
      index: true,
    },
    leadTimeDays: { type: Number, default: 2 },
    inclusions: {
      type: [String],
      default: [
        'Handcrafted signature keepsake presentation box',
        'Satin ribbon bow & botanical wax seal',
        'Complimentary personalized greeting tag',
      ],
    },
    dimensions: {
      type: String,
      default: '28 cm × 24 cm × 12 cm · Protective multi-layer transit cushioning',
    },
    careInstructions: {
      type: String,
      default:
        'Store in a cool, dry indoor space away from direct moisture and harsh sunlight. Dust gently with a soft dry cloth.',
    },
    isCustomizable: { type: Boolean, default: false },
    customizationOptions: {
      allowCustomTag: { type: Boolean, default: false },
      defaultTags: [{ type: String }],
      ribbonColors: [{ type: String }],
      requiresPhotoUpload: { type: Boolean, default: false },
      maxPhotosAllowed: { type: Number, default: 0 },
    },
    ratings: {
      average: { type: Number, default: 5.0, min: 1, max: 5 },
      count: { type: Number, default: 1 },
    },
    badges: [
      {
        type: String,
        enum: ['NEW', 'SALE', 'BESTSELLER', 'LIMITED'],
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
