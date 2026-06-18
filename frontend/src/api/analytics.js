
import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
/**
 * Fetch high-level dashboard statistics.
 * @returns {{ total_events, total_sessions, page_views, clicks, top_pages, events_last_24h }}
 */
export const fetchStats = async () => {
  const { data } = await api.get('/stats');
  return data.data;
};

/**
 * 
 * @returns {Array<{ session_id, total_events, page_views, clicks, unique_pages, first_seen, last_seen }>}
 */
export const fetchSessions = async () => {
  const { data } = await api.get('/sessions');
  return data.data;
};

/**
 * 
 * @param {string} sessionId
 * @returns {Array<{ event_type, page_url, timestamp, metadata }>}
 */
export const fetchSessionEvents = async (sessionId) => {
  const { data } = await api.get(`/sessions/${sessionId}/events`);
  return data;
};

/**
 *
 * @param {string} pageUrl 
 * @returns {Array<{ x, y, timestamp }>}
 */
export const fetchHeatmapData = async (pageUrl) => {
  const { data } = await api.get('/heatmap', {
    params: { pageUrl },
  });
  return data;
};

/**
 * 
 *
 * @returns {string[]}
 */
export const fetchHeatmapPages = async () => {
  const { data } = await api.get('/heatmap/pages');
  return data.data;
};

export default api;
