const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { categoriesSeed, productsSeed, instagramPostsSeed } = require('../seed/seedData');

function makeId() {
  return crypto.randomBytes(12).toString('hex');
}

class DevMemoryStore {
  constructor() {
    this.initialized = false;
    this.users = [];
    this.categories = [];
    this.products = [];
    this.instagramPosts = [];
    this.orders = [];
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    const now = new Date().toISOString();

    // 1. Seed Users
    const adminPasswordHash = bcrypt.hashSync(
      process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345',
      10
    );
    const customerPasswordHash = bcrypt.hashSync('Customer@123', 10);

    const adminUser = {
      _id: makeId(),
      name: 'Artistic Fusion Studio Admin',
      email: 'admin@artisticfusion.com',
      phone: '9876543210',
      password: adminPasswordHash,
      role: 'admin',
      savedAddress: {
        addressLine: 'Artistic Fusion Craft Studio, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
      },
      createdAt: now,
      updatedAt: now,
    };

    const demoCustomer = {
      _id: makeId(),
      name: 'Ananya Sharma',
      email: 'customer@artisticfusion.com',
      phone: '9820112233',
      password: customerPasswordHash,
      role: 'customer',
      savedAddress: {
        addressLine: '402 Roseate Residency, Indiranagar 12th Main',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
      },
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(adminUser, demoCustomer);

    // 2. Seed Categories
    this.categories = categoriesSeed.map((cat) => ({
      _id: makeId(),
      ...cat,
      createdAt: now,
      updatedAt: now,
    }));

    const catBySlug = new Map(this.categories.map((c) => [c.slug, c]));

    // 3. Seed Products
    this.products = productsSeed.map(({ categorySlug, ...prod }) => {
      const cat = catBySlug.get(categorySlug) || this.categories[0];
      return {
        _id: makeId(),
        videoUrl: null,
        careInstructions:
          'Store in a cool, dry indoor space away from direct moisture and harsh sunlight. Dust gently with a soft dry cloth.',
        ...prod,
        category: { _id: cat._id, name: cat.name, slug: cat.slug },
        createdAt: now,
        updatedAt: now,
      };
    });

    const prodBySlug = new Map(this.products.map((p) => [p.slug, p]));

    // 4. Seed Instagram Posts
    this.instagramPosts = instagramPostsSeed.map(({ productSlugs, ...post }) => ({
      _id: makeId(),
      ...post,
      isActive: true,
      products: productSlugs.map((s) => prodBySlug.get(s)).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    }));

    // 5. Seed Initial Demo Orders
    const p1 = prodBySlug.get('wrapped-just-for-you-luxury-hamper');
    const p2 = prodBySlug.get('heirloom-linen-handcrafted-memory-album');

    this.orders = [
      {
        _id: makeId(),
        orderNumber: 'AF-904112',
        user: demoCustomer._id,
        customer: {
          name: 'Ananya Sharma',
          email: 'customer@artisticfusion.com',
          phone: '9820112233',
        },
        shippingAddress: {
          addressLine: '402 Roseate Residency, Indiranagar 12th Main',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
        },
        items: [
          {
            product: p1._id,
            title: p1.title,
            slug: p1.slug,
            price: p1.price,
            quantity: 1,
            image: p1.images[0].url,
            customization: {
              selectedTag: 'Happy Birthday',
              selectedRibbon: 'Blush Rose',
              customNote: 'Wishing you the warmest year ahead!',
              customerUploadedPhotos: [],
            },
          },
        ],
        giftMessage: 'Happy Birthday Riya! Hope this handmade box makes you smile.',
        addGiftCardUpsell: false,
        couponCode: null,
        pricing: {
          subtotal: 2499,
          shippingFee: 0,
          giftWrapFee: 0,
          gstAmount: 0,
          discount: 0,
          total: 2499,
        },
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'HANDCRAFTING',
        trackingCode: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: makeId(),
        orderNumber: 'AF-904189',
        user: demoCustomer._id,
        customer: {
          name: 'Kabir Mehta',
          email: 'kabir.mehta@example.com',
          phone: '9811445566',
        },
        shippingAddress: {
          addressLine: '18A Gulmohar Park, Hauz Khas',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110049',
        },
        items: [
          {
            product: p2._id,
            title: p2.title,
            slug: p2.slug,
            price: p2.price,
            quantity: 1,
            image: p2.images[0].url,
            customization: {
              selectedTag: 'Our Forever Story',
              selectedRibbon: 'Royal Gold',
              customNote: 'Anniversary Edition',
              customerUploadedPhotos: [
                'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=80',
              ],
            },
          },
        ],
        giftMessage: 'Happy 3rd Anniversary!',
        addGiftCardUpsell: false,
        couponCode: null,
        pricing: {
          subtotal: 1899,
          shippingFee: 99,
          giftWrapFee: 0,
          gstAmount: 0,
          discount: 0,
          total: 1998,
        },
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'RECEIVED',
        trackingCode: null,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  signToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'artistic_fusion_fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  makeId() {
    return makeId();
  }
}

const devStore = new DevMemoryStore();
module.exports = devStore;
