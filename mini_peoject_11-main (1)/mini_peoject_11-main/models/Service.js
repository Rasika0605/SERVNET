const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Home', 'Repair', 'Cleaning']
  },
  priceRange: {
    type: String,
    required: [true, 'Please add a price range'],
    default: '$50 - $150'
  },
  icon: {
    type: String,
    default: '🔧'
  },
  description: {
    type: String,
    default: 'Professional service provided by ServNet'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);
