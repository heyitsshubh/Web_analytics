
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
router.post('/events', createEvent);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId/events', getSessionEvents);
router.get('/heatmap/pages', getHeatmapPages);
router.get('/heatmap', getHeatmapData);
router.get('/stats', getStats);
module.exports = router;
