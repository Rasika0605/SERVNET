const Service = require('../models/Service');

// @desc    Fetch all services available in catalog
// @route   GET /api/services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new service to the catalog (Admin only)
// @route   POST /api/services
exports.createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
