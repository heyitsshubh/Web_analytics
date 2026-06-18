/**
 * Analytics API Client
 * =====================
 * Centralised Axios instance and typed API helpers for all backend endpoints.
 * All functions are async and return the unwrapped `data` field from responses.
 */

import axios from 'axios';

/* ─────────────────────── Axios Instance ────────────────────────────── */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ─────────────────────── Response Interceptor ───────────────────────── */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    // Rethrow with a clean message for components to display
    return Promise.reject(new Error(message));
  }
);

/* ─────────────────────── API Methods ───────────────────────────────── */

/**
 * Fetch high-level dashboard statistics.
 * @returns {{ total_events, total_sessions, page_views, clicks, top_pages, events_last_24h }}
 */
export const fetchStats = async () => {
  const { data } = await api.get('/stats');
  return data.data;
};

/**
 * Fetch all sessions with aggregated metrics.
 * @returns {Array<{ session_id, total_events, page_views, clicks, unique_pages, first_seen, last_seen }>}
 */
export const fetchSessions = async () => {
  const { data } = await api.get('/sessions');
  return data.data;
};

/**
 * Fetch the full event timeline for a specific session.
 * @param {string} sessionId
 * @returns {Array<{ event_type, page_url, timestamp, metadata }>}
 */
export const fetchSessionEvents = async (sessionId) => {
  const { data } = await api.get(`/sessions/${sessionId}/events`);
  return data;
};

/**
 * Fetch click heatmap data for a specific page URL.
 * @param {string} pageUrl - The full page URL to filter by
 * @returns {Array<{ x, y, timestamp }>}
 */
export const fetchHeatmapData = async (pageUrl) => {
  const { data } = await api.get('/heatmap', {
    params: { pageUrl },
  });
  return data;
};

/**
 * Fetch all unique page URLs that have recorded click events.
 * Used to populate the heatmap URL dropdown.
 * @returns {string[]}
 */
export const fetchHeatmapPages = async () => {
  const { data } = await api.get('/heatmap/pages');
  return data.data;
};

export default api;
