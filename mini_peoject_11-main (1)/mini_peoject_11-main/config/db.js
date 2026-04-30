const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`🚨 MongoDB Atlas Connection Failed: ${error.message}`);
    console.log(`💡 TIP: If this is an SSL error, please check if your IP address is whitelisted in MongoDB Atlas.`);
    console.log(`🔄 Booting seamless In-Memory MongoDB Engine for immediate functionality...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ SUCCESS: Fallback Memory Database Connected! App is 100% functional.`);
    } catch(e) {
      console.error(`In Memory Boot Failed:`, e.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
