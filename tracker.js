
(function () {
  'use strict';
  const scriptTag = document.currentScript;
  const BACKEND_URL =
    (scriptTag && scriptTag.getAttribute('data-backend-url')) ||
    (window.__TRACKER_CONFIG__ && window.__TRACKER_CONFIG__.backendUrl) ||
    'http://localhost:5000';

  const API_ENDPOINT = `${BACKEND_URL}/api/events`;
  const SESSION_KEY = '_wt_session_id';
  const DEBUG = false; // Set true to see console logs

  /* ─────────────────────────── UUID Generator ────────────────────────── */

  /**
   * Generates a UUID v4 string.
   * Uses crypto.randomUUID if available (modern browsers), falls back to
   * Math.random-based implementation for older environments.
   * @returns {string} UUID v4 string
   */
  function generateUUID() {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /* ────────────────────────── Session Management ──────────────────────── */

  /**
   * Retrieves the existing session ID from localStorage or creates a new one.
   * The session ID persists across page loads for the same browser.
   * @returns {string} UUID session identifier
   */
  function getSessionId() {
    try {
      let sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
        log('New session created:', sessionId);
      } else {
        log('Reusing session:', sessionId);
      }
      return sessionId;
    } catch (e) {
      // localStorage may be unavailable in some contexts (e.g., private mode restrictions)
      // Fall back to an in-memory session ID for this page load
      if (!window.__wt_fallback_session__) {
        window.__wt_fallback_session__ = generateUUID();
        log('Fallback in-memory session created:', window.__wt_fallback_session__);
      }
      return window.__wt_fallback_session__;
    }
  }

  /* ───────────────────────────── Utilities ────────────────────────────── */

  function log(...args) {
    if (DEBUG) {
      console.log('[WebTracker]', ...args);
    }
  }

  /* ─────────────────────────── Event Dispatch ─────────────────────────── */

  /**
   * Sends an analytics event payload to the backend API.
   * Uses the Fetch API with a fire-and-forget approach.
   * Does NOT block the UI thread or throw on failure.
   *
   * @param {Object} eventData - The event payload to send
   */
  async function sendEvent(eventData) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // keepalive ensures the request completes even if the page unloads
        keepalive: true,
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        log('Server responded with error:', response.status);
      } else {
        log('Event sent:', eventData.event_type, eventData.page_url);
      }
    } catch (error) {
      // Silently fail — analytics should never break the host site
      log('Failed to send event:', error.message);
    }
  }

  /* ─────────────────────── Event Type: Page View ──────────────────────── */

  /**
   * Tracks a page view event.
   * Automatically called on DOMContentLoaded.
   * Captures: session_id, current URL, timestamp.
   */
  function trackPageView() {
    const event = {
      session_id: getSessionId(),
      event_type: 'page_view',
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      metadata: {
        x: null,
        y: null,
      },
    };
    sendEvent(event);
  }

  /* ─────────────────────── Event Type: Click ─────────────────────────── */

  /**
   * Sets up a global click listener on the document.
   * Captures: mouse x/y coordinates (relative to viewport), session_id, page URL, timestamp.
   */
  function initClickTracking() {
    document.addEventListener(
      'click',
      function (e) {
        const event = {
          session_id: getSessionId(),
          event_type: 'click',
          page_url: window.location.href,
          timestamp: new Date().toISOString(),
          metadata: {
            x: Math.round(e.clientX),
            y: Math.round(e.clientY),
          },
        };
        sendEvent(event);
      },
      { passive: true } // Passive listener for performance — does NOT call preventDefault
    );
  }

  /* ────────────────────────── Initialization ──────────────────────────── */

  /**
   * Bootstraps the tracker:
   * 1. Fires page_view on DOMContentLoaded (or immediately if DOM is ready)
   * 2. Attaches global click listener
   */
  function init() {
    // Track initial page view
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
      // DOM is already ready (script loaded at end of body or deferred)
      trackPageView();
    }

    // Track all click events
    initClickTracking();

    log('WebTracker initialized. Backend:', BACKEND_URL);
  }

  // Bootstrap
  init();

  // Expose minimal public API for advanced usage
  window.WebTracker = {
    getSessionId,
    trackPageView,
  };
})();
