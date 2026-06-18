/**
 * Server Entry Point
 * ===================
 * Loads environment variables, connects to the database,
 * and starts the HTTP server.
 */

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces

/**
 * Bootstrap the application:
 * 1. Connect to MongoDB
 * 2. Start the HTTP server
 */
const startServer = async () => {
  try {
    // Establish database connection before accepting requests
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  🚀  Web Analytics API — Server Started');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  📡  URL        : http://localhost:${PORT}`);
      console.log(`  🌍  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  ❤️   Health     : http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

    /* ─────────────── Graceful Shutdown ─────────────────────────────── */

    /**
     * Gracefully shuts down the server on SIGTERM/SIGINT signals.
     * Closes the HTTP server first, then the database connection.
     */
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed');
        console.log('👋 Goodbye!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
