const express = require('express');
const { getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'staff'), getDashboardStats);

module.exports = router;
