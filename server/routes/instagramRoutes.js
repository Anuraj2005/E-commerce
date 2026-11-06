const express = require('express');
const { getInstagramFeed } = require('../controllers/instagramController');

const router = express.Router();

router.get('/', getInstagramFeed);

module.exports = router;
