/**
 * Event Routes
 * =============
 * Wires HTTP routes to controller handlers.
 * All routes are prefixed with /api (set in app.js).
 */

const express = require('express');
const router = express.Router();

const {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmapData,
  getHeatmapPages,
  getStats,
} = require('../controllers/event.controller');

/* ─────────────────────── Event Routes ─────────────────────────────── */

/**
 * POST /api/events
 * Store a new analytics event from the tracker script.
 */
router.post('/events', createEvent);

/* ─────────────────────── Session Routes ────────────────────────────── */

/**
 * GET /api/sessions
 * Get all sessions with aggregated stats (total events, first/last seen, etc.)
 */
router.get('/sessions', getSessions);

/**
 * GET /api/sessions/:sessionId/events
 * Get the full event timeline for a specific session (user journey).
 */
router.get('/sessions/:sessionId/events', getSessionEvents);

/* ─────────────────────── Heatmap Routes ────────────────────────────── */

/**
 * GET /api/heatmap/pages
 * Get all unique page URLs that have recorded click events.
 * NOTE: This route must be defined BEFORE /api/heatmap to avoid Express
 * matching "pages" as the :pageUrl param.
 */
router.get('/heatmap/pages', getHeatmapPages);

/**
 * GET /api/heatmap?pageUrl=https://example.com
 * Get all click x/y coordinates for a specific page URL.
 */
router.get('/heatmap', getHeatmapData);

/* ─────────────────────── Stats Routes ──────────────────────────────── */

/**
 * GET /api/stats
 * Get high-level platform statistics for the dashboard overview.
 */
router.get('/stats', getStats);

module.exports = router;
