
const mongoose = require('mongoose');
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
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      trim: true,
      index: true,
    },
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: "event_type must be 'page_view' or 'click', got '{VALUE}'",
      },
      index: true,
    },
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: [true, 'timestamp is required'],
      default: Date.now,
    },
    metadata: {
      type: metadataSchema,
      default: () => ({ x: null, y: null }),
    },
  },
  {
    timestamps: true,
    collection: 'events',
    toJSON: { virtuals: true },
  }
);
eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ event_type: 1, page_url: 1 });
eventSchema.index({ session_id: 1, createdAt: -1 });
module.exports = mongoose.model('Event', eventSchema);
