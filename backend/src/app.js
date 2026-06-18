/**
 * Express Application
 * ====================
 * Configures middleware, routes, and error handlers.
 * Exported separately from server.js for testability.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const eventRoutes = require('./routes/event.routes');

const app = express();

/* ─────────────────────── Security Middleware ────────────────────────── */

// Helmet sets secure HTTP headers (XSS protection, HSTS, etc.)
app.use(
  helmet({
    // Allow cross-origin resource sharing for embedded tracker script
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* ─────────────────────── CORS Configuration ─────────────────────────── */

// Allow all origins — required so tracker.js works on any host website
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
  })
);

// Handle pre-flight OPTIONS requests
app.options('*', cors());

/* ─────────────────────── Request Logging ───────────────────────────── */

// Use 'dev' format in development, 'combined' in production
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ─────────────────────── Body Parsing ──────────────────────────────── */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ─────────────────────── API Routes ────────────────────────────────── */

app.use('/api', eventRoutes);

/* ─────────────────────── Health Check ──────────────────────────────── */

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ─────────────────────── 404 Handler ───────────────────────────────── */

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found`,
  });
});

/* ─────────────────────── Global Error Handler ───────────────────────── */

// Must have 4 parameters for Express to recognise it as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);

  // Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry detected',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
