const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const InstagramPost = require('../models/InstagramPost');
const { hasValidMongoUri } = require('../config/db');
const { categoriesSeed, productsSeed, instagramPostsSeed } = require('./seedData');

async function runSeeder() {
  const uri = process.env.MONGODB_URI;
  if (!hasValidMongoUri(uri)) {
    console.error(
      '\n[SEED ERROR] Please configure your active MONGODB_URI in server/.env before running `npm run seed`.\n' +
        'Note: In local development (`npm run dev`), this same seed catalog automatically loads into memory if MONGODB_URI is not set yet.\n'
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas for seeding...');

  if (process.argv[2] === '-d') {
    await Promise.all([
      Order.deleteMany({}),
      InstagramPost.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('All Artistic Fusion collections cleared.');
    process.exit(0);
  }

  // Clear existing catalog & test records cleanly
  await Promise.all([
    Order.deleteMany({}),
    InstagramPost.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({ email: { $in: ['admin@artisticfusion.com', 'customer@artisticfusion.com'] } }),
  ]);

  // 1. Seed Default Admin & Test Customer
  const adminUser = await User.create({
    name: 'Artistic Fusion Studio Admin',
    email: 'admin@artisticfusion.com',
    phone: '9876543210',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345',
    role: 'admin',
  });

  const demoCustomer = await User.create({
    name: 'Ananya Sharma',
    email: 'customer@artisticfusion.com',
    phone: '9820112233',
    password: 'Customer@123',
    role: 'customer',
    savedAddress: {
      addressLine: '402 Roseate Residency, Indiranagar 12th Main',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
  });

  // 2. Seed Categories (7 Story Highlights)
  const createdCategories = await Category.insertMany(categoriesSeed);
  const categoryMap = new Map(createdCategories.map((c) => [c.slug, c._id]));

  // 3. Seed Products
  const productDocs = productsSeed.map(({ categorySlug, ...rest }) => ({
    ...rest,
    category: categoryMap.get(categorySlug),
  }));
  const createdProducts = await Product.insertMany(productDocs);
  const productSlugMap = new Map(createdProducts.map((p) => [p.slug, p]));

  // 4. Seed Instagram UGC Posts
  const instaDocs = instagramPostsSeed.map(({ productSlugs, ...rest }) => ({
    ...rest,
    products: productSlugs
      .map((slug) => productSlugMap.get(slug)?._id)
      .filter(Boolean),
  }));
  await InstagramPost.insertMany(instaDocs);

  // 5. Seed Sample Orders for Admin Dashboard & Kanban Board
  const p1 = productSlugMap.get('wrapped-just-for-you-luxury-hamper');
  const p2 = productSlugMap.get('heirloom-linen-handcrafted-memory-album');

  await Order.insertMany([
    {
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
    },
    {
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
    },
  ]);

  console.log('\n============================================================');
  console.log('✨ Artistic Fusion MongoDB Atlas Seeding Complete!');
  console.log(`   Admin Login    : ${adminUser.email} / Admin@12345`);
  console.log(`   Demo Customer  : ${demoCustomer.email} / Customer@123`);
  console.log(`   Categories     : ${createdCategories.length}`);
  console.log(`   Products       : ${createdProducts.length}`);
  console.log(`   Instagram UGC  : ${instaDocs.length}`);
  console.log('============================================================\n');

  process.exit(0);
}

runSeeder().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
