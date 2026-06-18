
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, HOST, () => {
      console.log('');
      console.log('zWeb Analytics API — Server Started');
      console.log(`URL: http://localhost:${PORT}`);
      console.log(` Environment:${process.env.NODE_ENV || 'development'}`);
      console.log(` Health: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed');
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log(' MongoDB connection closed');
        console.log(' Goodbye!');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
