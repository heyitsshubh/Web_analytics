
const Event = require('../models/Event');
const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message });

/**
 * @desc    Create and persist a new analytics event
 * @route   POST /api/events
 * @access  Public (called by tracker.js from any host page)
 */
const createEvent = async (req, res) => {
  try {
    const { session_id, event_type, page_url, timestamp, metadata } = req.body;
    if (!session_id || typeof session_id !== 'string') {
      return sendError(res, 400, 'session_id is required and must be a string');
    }
    if (!event_type) {
      return sendError(res, 400, 'event_type is required');
    }
    if (!page_url || typeof page_url !== 'string') {
      return sendError(res, 400, 'page_url is required and must be a string');
    }
    const event = await Event.create({
      session_id: session_id.trim(),
      event_type,
      page_url: page_url.trim(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      metadata: {
        x: metadata?.x ?? null,
        y: metadata?.y ?? null,
      },
    });

    return res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendError(res, 400, messages.join(', '));
    }
    console.error('[createEvent]', error);
    return sendError(res, 500, 'Internal server error');
  }
};
/**
 * @desc    Get all sessions with aggregated metrics
 * @route   GET /api/sessions
 * @access  Public
 *
 * Returns sessions sorted by most recent activity (last_seen DESC).
 * Each session includes: total events, page_views, clicks, unique pages.
 */
const getSessions = async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      // ── Stage 1: Group by session_id ──────────────────────────────
      {
        $group: {
          _id: '$session_id',
          total_events: { $sum: 1 },
          first_seen: { $min: '$timestamp' },
          last_seen: { $max: '$timestamp' },
          page_views: {
            $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
          },
          pages_visited: { $addToSet: '$page_url' },
        },
      },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          total_events: 1,
          first_seen: 1,
          last_seen: 1,
          page_views: 1,
          clicks: 1,
          unique_pages: { $size: '$pages_visited' },
        },
      },
      { $sort: { last_seen: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error('[getSessions]', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * @desc   
 * @route   
 * @access  
 */
const getSessionEvents = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return sendError(res, 400, 'sessionId parameter is required');
    }

    const events = await Event.find({ session_id: sessionId })
      .sort({ timestamp: 1 })
      .select('-__v')         
      .lean();                 

    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: `No events found for session: ${sessionId}`,
      });
    }

    return res.status(200).json({
      success: true,
      session_id: sessionId,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('[getSessionEvents]', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * @desc    Get all click events for a specific page URL (for heatmap rendering)
 * @route   GET /api/heatmap?pageUrl=https://example.com
 * @access  Public
 */
const getHeatmapData = async (req, res) => {
  try {
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return sendError(res, 400, 'pageUrl query parameter is required');
    }

    const clicks = await Event.find({
      event_type: 'click',
      page_url: decodeURIComponent(pageUrl),
    })
      .select('metadata.x metadata.y timestamp -_id')
      .lean();
    const heatmapData = clicks
      .filter((c) => c.metadata?.x !== null && c.metadata?.y !== null)
      .map((click) => ({
        x: click.metadata.x,
        y: click.metadata.y,
        timestamp: click.timestamp,
      }));

    return res.status(200).json({
      success: true,
      page_url: pageUrl,
      count: heatmapData.length,
      data: heatmapData,
    });
  } catch (error) {
    console.error('[getHeatmapData]', error);
    return sendError(res, 500, 'Internal server error');
  }
};
/**
 * @desc    Get all unique page URLs that have recorded click events
 * @route   GET /api/heatmap/pages
 * @access  Public
 */
const getHeatmapPages = async (req, res) => {
  try {
    const pages = await Event.distinct('page_url', { event_type: 'click' });

    return res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });
  } catch (error) {
    console.error('[getHeatmapPages]', error);
    return sendError(res, 500, 'Internal server error');
  }
};
/**
 * @desc    Aggregate overall platform statistics for the dashboard overview
 * @route   GET /api/stats
 * @access  Public
 */
const getStats = async (req, res) => {
  try {
    const [totalEvents, uniqueSessions, eventsByType, topPages, recentEvents] =
      await Promise.all([
        Event.countDocuments(),
        Event.distinct('session_id').then((ids) => ids.length),
        Event.aggregate([
          { $group: { _id: '$event_type', count: { $sum: 1 } } },
        ]),
        Event.aggregate([
          { $match: { event_type: 'page_view' } },
          { $group: { _id: '$page_url', views: { $sum: 1 } } },
          { $sort: { views: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, page_url: '$_id', views: 1 } },
        ]),
        Event.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
      ]);
    const eventTypeMap = eventsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        total_events: totalEvents,
        total_sessions: uniqueSessions,
        page_views: eventTypeMap['page_view'] || 0,
        clicks: eventTypeMap['click'] || 0,
        events_last_24h: recentEvents,
        top_pages: topPages,
      },
    });
  } catch (error) {
    console.error('[getStats]', error);
    return sendError(res, 500, 'Internal server error');
  }
};
module.exports = {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmapData,
  getHeatmapPages,
  getStats,
};
