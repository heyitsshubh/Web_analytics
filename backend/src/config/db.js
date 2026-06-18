
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,         
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    mongoose.connection.on('disconnected', () => {
      console.warn(' MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); 
  }
};
module.exports = connectDB;
