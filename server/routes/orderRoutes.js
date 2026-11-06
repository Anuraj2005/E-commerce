const express = require('express');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Amazon/Flipkart style: user must be signed in at order placement time
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, authorize('admin', 'staff'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);

module.exports = router;
