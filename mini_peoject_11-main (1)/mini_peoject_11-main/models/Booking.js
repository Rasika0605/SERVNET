const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Optional until a provider accepts
  },
  service: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: [true, 'Please add a booking date']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please add a time slot']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Service', 'Online Payment', 'UPI / Card'],
    default: 'Cash on Service'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  location: {
    type: String,
    required: [true, 'Please provide an address']
  },
  landmark: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    required: [true, 'Please provide a pincode']
  },
  problemDescription: {
    type: String,
    default: ''
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  customerName: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  totalCost: {
    type: String,
    default: ''
  },
  providerName: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
