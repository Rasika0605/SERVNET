const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const seedServices = require('./config/seed');

// Load environment variables
dotenv.config();

// Connect to MongoDB and seed default data, then start the server
connectDB().then(() => {
  seedServices();
  
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(express.json());
  app.use(cors());

  // Serve static frontend HTML, CSS, JS files
  app.use(express.static(__dirname));

  // API Routes
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/bookings', require('./routes/bookingRoutes'));
  app.use('/api/services', require('./routes/serviceRoutes'));

  // Basic sanity-check route
  app.get('/api', (req, res) => {
    res.json({ message: 'ServNet API is running normally...' });
  });

  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
