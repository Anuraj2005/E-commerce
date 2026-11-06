const Order = require('../models/Order');
const Product = require('../models/Product');
const { isDbConnected } = require('../config/db');
const devStore = require('../services/devMemoryStore');

exports.getDashboardStats = async (_req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (isDbConnected()) {
      const [orders, products] = await Promise.all([
        Order.find({}).sort({ createdAt: -1 }).lean(),
        Product.find({ isActive: true }).populate('category', 'name slug').lean(),
      ]);

      return res.status(200).json({
        success: true,
        stats: computeMetrics(orders, products, startOfToday),
      });
    }

    devStore.init();
    const orders = devStore.orders;
    const products = devStore.products.filter((p) => p.isActive !== false);

    return res.status(200).json({
      success: true,
      stats: computeMetrics(orders, products, startOfToday),
    });
  } catch (err) {
    next(err);
  }
};

function computeMetrics(orders, products, startOfToday) {
  const validOrders = orders.filter((o) => o.fulfillmentStatus !== 'CANCELLED');

  const todayOrders = validOrders.filter((o) => new Date(o.createdAt) >= startOfToday);
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const pendingHandcraftingCount = orders.filter((o) =>
    ['RECEIVED', 'HANDCRAFTING'].includes(o.fulfillmentStatus)
  ).length;

  const lowStockProducts = products
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const statusBreakdown = ['RECEIVED', 'HANDCRAFTING', 'PACKED', 'SHIPPED', 'DELIVERED'].map(
    (status) => ({
      status,
      count: orders.filter((o) => o.fulfillmentStatus === status).length,
    })
  );

  // Category inventory & catalog value breakdown for Recharts
  const categoryMap = new Map();
  products.forEach((p) => {
    const catName = p.subCategory || p.category?.name || 'Crafts';
    const current = categoryMap.get(catName) || { name: catName, stock: 0, products: 0 };
    current.stock += p.stock || 0;
    current.products += 1;
    categoryMap.set(catName, current);
  });

  return {
    totalOrders: validOrders.length,
    todayOrdersCount: todayOrders.length,
    totalRevenue,
    todayRevenue,
    pendingHandcraftingCount,
    totalActiveProducts: products.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    statusBreakdown,
    categoryChartData: Array.from(categoryMap.values()),
    recentOrders: orders.slice(0, 6),
    storageMode: isDbConnected() ? 'mongodb-atlas' : 'dev-memory',
  };
}
