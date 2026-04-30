const express = require('express');
const { getServices, createService } = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(getServices).post(protect, admin, createService);

module.exports = router;
