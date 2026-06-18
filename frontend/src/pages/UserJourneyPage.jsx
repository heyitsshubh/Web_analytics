/**
 * User Journey Page
 * ==================
 * Displays the full chronological event timeline for a single session.
 * Shows page views and clicks in sequence with timestamps and metadata.
 *
 * Route: /sessions/:sessionId
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TimelineEvent from '../components/TimelineEvent';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { fetchSessionEvents } from '../api/analytics';

/* ─────────────────────── Utility ───────────────────────────────────── */

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
      hour12: true,
    });
  } catch { return '—'; }
}

function sessionDuration(events) {
  if (!events?.length) return '—';
  const times = events.map((e) => new Date(e.timestamp).getTime()).filter(Boolean);
  if (times.length < 2) return '0s';
  const diff = Math.max(...times) - Math.min(...times);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s} seconds`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/* ─────────────────────── Component ─────────────────────────────────── */

export default function UserJourneyPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'page_view' | 'click'

  const loadEvents = useCallback(async () => {
    if (!sessionId) return;
    try {
      setError(null);
      setLoading(true);
      const result = await fetchSessionEvents(sessionId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /* ── Derived Stats ── */
  const events = data?.data || [];
  const pageViews = events.filter((e) => e.event_type === 'page_view').length;
  const clicks = events.filter((e) => e.event_type === 'click').length;
  const uniquePages = new Set(events.map((e) => e.page_url)).size;
  const duration = sessionDuration(events);

  /* ── Filtered Events ── */
  const filteredEvents = filter === 'all'
    ? events
    : events.filter((e) => e.event_type === filter);

  /* ── Loading ── */
  if (loading) {
    return <LoadingSpinner fullPage message="Loading user journey..." />;
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="page-container">
        <button className="btn-ghost mb-6" onClick={() => navigate('/sessions')}>
          ← Back to Sessions
        </button>
        <EmptyState
          title="Session not found"
          message={error}
          icon={
            <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          action={
            <button className="btn-primary" onClick={() => navigate('/sessions')}>
              Back to Sessions
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* ── Breadcrumb / Back ── */}
      <button
        className="btn-ghost mb-6 -ml-2"
        onClick={() => navigate('/sessions')}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Sessions
      </button>

      {/* ── Session Header ── */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
              Session ID
            </p>
            <h2 className="text-lg font-mono font-bold text-brand-light break-all leading-snug">
              {sessionId}
            </h2>
            {events.length > 0 && (
              <p className="text-sm text-slate-400 mt-2">
                {formatDateTime(events[0]?.timestamp)}
              </p>
            )}
          </div>

          {/* ── Session Meta Badges ── */}
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-card-border">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">{pageViews}</span> page views
              </span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-card-border">
              <span className="w-2 h-2 rounded-full bg-brand-light" />
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">{clicks}</span> clicks
              </span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-card-border">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">{uniquePages}</span> unique pages
              </span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-card-border">
              <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">{duration}</span> duration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 mb-6">
        <p className="text-sm text-slate-400 mr-2">Filter:</p>
        {[
          { key: 'all', label: `All (${events.length})` },
          { key: 'page_view', label: `Page Views (${pageViews})` },
          { key: 'click', label: `Clicks (${clicks})` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? 'bg-brand text-white shadow-glow-brand'
                : 'bg-card border border-card-border text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div className="max-w-2xl">
        {!filteredEvents.length ? (
          <EmptyState
            title="No events match filter"
            message="Try switching to 'All' to see all events."
          />
        ) : (
          <div>
            {filteredEvents.map((event, idx) => (
              <TimelineEvent
                key={event._id || idx}
                event={event}
                isLast={idx === filteredEvents.length - 1}
                index={idx}
              />
            ))}

            {/* End of journey marker */}
            <div className="flex items-center gap-3 mt-2 animate-fade-in">
              <div className="w-3 h-3 rounded-full bg-slate-600 ring-4 ring-surface" />
              <p className="text-xs text-slate-500 italic">End of session</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
