const express = require('express');
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, authorize('admin', 'staff'), createProduct);
router.put('/:id', protect, authorize('admin', 'staff'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
