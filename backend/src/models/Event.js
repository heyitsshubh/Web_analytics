/**
 * Event Model
 * ============
 * Mongoose schema and model for analytics events.
 * Supports two event types: 'page_view' and 'click'.
 */

const mongoose = require('mongoose');

/* ─────────────────────── Sub-Schema: Metadata ──────────────────────── */

/**
 * Metadata sub-document for storing click coordinates.
 * x and y are clientX/clientY from the browser's MouseEvent.
 * Both default to null for page_view events (no coordinates needed).
 */
const metadataSchema = new mongoose.Schema(
  {
    x: {
      type: Number,
      default: null,
      min: [0, 'X coordinate cannot be negative'],
    },
    y: {
      type: Number,
      default: null,
      min: [0, 'Y coordinate cannot be negative'],
    },
  },
  { _id: false } // No separate _id for sub-documents
);

/* ──────────────────────── Main Event Schema ─────────────────────────── */

const eventSchema = new mongoose.Schema(
  {
    /**
     * Unique identifier for a user session.
     * Generated client-side using UUID v4 and stored in localStorage.
     */
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      trim: true,
      index: true,
    },

    /**
     * The type of analytics event.
     * 'page_view' — triggered automatically when a page loads.
     * 'click'     — triggered on any user click with x/y coordinates.
     */
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: "event_type must be 'page_view' or 'click', got '{VALUE}'",
      },
      index: true,
    },

    /**
     * The full URL of the page where the event occurred.
     */
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true,
      index: true,
    },

    /**
     * ISO 8601 timestamp of when the event occurred on the client.
     * Defaults to the time of document creation if not provided.
     */
    timestamp: {
      type: Date,
      required: [true, 'timestamp is required'],
      default: Date.now,
    },

    /**
     * Optional metadata — primarily used for click events to store
     * the x/y screen coordinates.
     */
    metadata: {
      type: metadataSchema,
      default: () => ({ x: null, y: null }),
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true,
    // Use a clean, explicit collection name
    collection: 'events',
    // Enable virtuals in toJSON output
    toJSON: { virtuals: true },
  }
);

/* ─────────────────────── Compound Indexes ───────────────────────────── */

// Optimise session journey queries (session_id + timestamp ordering)
eventSchema.index({ session_id: 1, timestamp: 1 });

// Optimise heatmap queries (event_type + page_url filtering)
eventSchema.index({ event_type: 1, page_url: 1 });

// Optimise session aggregation (group by session, sort by latest)
eventSchema.index({ session_id: 1, createdAt: -1 });

/* ──────────────────────── Model Export ─────────────────────────────── */

module.exports = mongoose.model('Event', eventSchema);
