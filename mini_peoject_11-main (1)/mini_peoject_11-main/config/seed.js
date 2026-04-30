const Service = require('../models/Service');

const seedServices = async () => {
  try {
    // Clear existing to match the newly requested 12 items perfectly
    await Service.deleteMany({});

    console.log('Seeding default services into the database...');
    const defaultServices = [
      { name: 'Plumber', category: 'Repair', priceRange: '₹300 – ₹1500', icon: '🔧' },
      { name: 'Electrician', category: 'Repair', priceRange: '₹300 – ₹2000', icon: '⚡' },
      { name: 'Carpenter', category: 'Repair', priceRange: '₹500 – ₹2500', icon: '🧱' },
      { name: 'Cleaner', category: 'Cleaning', priceRange: '₹500 – ₹2000', icon: '🧽' },
      { name: 'Gardener', category: 'Home', priceRange: ' ₹300 – ₹1500', icon: '🌿' },
      { name: 'Painter', category: 'Home', priceRange: '₹1500 – ₹20,000+', icon: '🎨' },
      { name: 'Movers', category: 'Home', priceRange: '₹2000 – ₹15,000', icon: '🚚' },
      { name: 'HVAC', category: 'Repair', priceRange: '₹500 – ₹3000', icon: '❄️' },
      { name: 'Security', category: 'Home', priceRange: '₹8000 – ₹20,000', icon: '🛡️' },
      { name: 'Packers', category: 'Home', priceRange: '₹1500 – ₹10,000', icon: '📦' },
      { name: 'Handyman', category: 'Repair', priceRange: '₹300 – ₹1500', icon: '🧰' },
      { name: 'Smart Home', category: 'Home', priceRange: '₹2000 – ₹25,000', icon: '💡' }
    ];
    await Service.insertMany(defaultServices);
    console.log('Default services seeded successfully!');
  } catch (error) {
    console.error('Error seeding services:', error);
  }
};

module.exports = seedServices;
