const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// @desc    Register a generic user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, serviceCategory } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({ 
      name, email, password, role: role || 'customer', phone, location, serviceCategory 
    });
    
    // Respond with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      location: user.location || '',
      serviceCategory: user.serviceCategory || '',
      token: generateToken(user._id)
    });
  } catch (error) {
    const msg = error.message.includes('SSL') ? `${error.message}. TIP: Check MongoDB Atlas IP whitelist.` : error.message;
    res.status(500).json({ message: msg });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`Login failed: User with email ${email} not found.`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      if (role && user.role !== role) {
        return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        location: user.location || '',
        serviceCategory: user.serviceCategory || '',
        token: generateToken(user._id)
      });
    } else {
      console.log(`Login failed: Incorrect password for email ${email}.`);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    const msg = error.message.includes('SSL') ? `${error.message}. TIP: Check MongoDB Atlas IP whitelist.` : error.message;
    res.status(500).json({ message: msg });
  }
};

// @desc    Generate OTP for Password Reset
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;
    let user = await User.findOne({ email });

    // For demo purposes: Auto-create a mock user if they try to reset a non-existent email
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: email,
        password: 'temporaryPassword123!',
        role: 'customer',
        phone: phone || ''
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const expires = new Date(Date.now() + 10 * 60000);

    user.resetOtp = otp;
    user.otpExpires = expires;
    
    // As a bonus, verify/save the phone number to the user if they didn't have one
    if (phone && !user.phone) {
      user.phone = phone;
    }
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'OTP generated successfully',
      simulatedEmailContent: `ServNet SMS to ${phone || user.phone}:\nYour secure OTP code is: ${otp}` 
    });

  } catch (error) {
    const msg = error.message.includes('SSL') ? `${error.message}. TIP: Check MongoDB Atlas IP whitelist.` : error.message;
    res.status(500).json({ message: msg });
  }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password has been successfully updated' });

  } catch (error) {
    const msg = error.message.includes('SSL') ? `${error.message}. TIP: Check MongoDB Atlas IP whitelist.` : error.message;
    res.status(500).json({ message: msg });
  }
};
