const express = require('express');
const { createBooking, getBookings, updateBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createBooking).get(protect, getBookings);
router.route('/:id').put(protect, updateBooking);

module.exports = router;
