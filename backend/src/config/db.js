/**
 * Database Configuration
 * ========================
 * Establishes a Mongoose connection to MongoDB Atlas (or local MongoDB).
 * Reads the connection string from the MONGODB_URI environment variable.
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using Mongoose.
 * Exits the process on connection failure to prevent the server from
 * running without a database.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(uri, {
      // Mongoose 8+ has these options on by default, but listed for clarity
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
