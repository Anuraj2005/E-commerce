const express = require('express');
const { getUploadSignature } = require('../controllers/mediaController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Accessible to Admin/Staff for catalog photos and Customers uploading custom Album/A5 Frame photos
router.post('/upload-signature', optionalAuth, getUploadSignature);

module.exports = router;
