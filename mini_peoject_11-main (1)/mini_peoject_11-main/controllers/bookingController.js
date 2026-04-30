const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking({
      ...req.body,
      customer: req.user._id // Always attach the logged-in customer's ID
    });
    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings based on role
// @route   GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    
    // Customers only see their own bookings
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }
    // Providers see only pending bookings for their category (to accept) or their own assigned bookings
    else if (req.user.role === 'provider') {
      query.$or = [
        { status: 'Pending', service: req.user.serviceCategory },
        { provider: req.user._id }
      ];
    }

    const bookings = await Booking.find(query).populate('customer', 'name email phone').populate('service', 'name category priceRange');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking (status, accept provider, payment)
// @route   PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Dynamically update fields if they were passed in request
    if (req.body.status) booking.status = req.body.status;
    if (req.body.paymentStatus) booking.paymentStatus = req.body.paymentStatus;
    if (req.body.provider) booking.provider = req.body.provider;
    if (req.body.providerName) booking.providerName = req.body.providerName;
    if (req.body.timeSlot) booking.timeSlot = req.body.timeSlot;

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
