
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { fetchStats, fetchSessions } from '../api/analytics';
function formatRelativeTime(dateStr) {
  if (!dateStr) return 'N/A';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname || '/';
  } catch {
    return url;
  }
}
const Icons = {
  sessions: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  events: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
  pageViews: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  ),
  clicks: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
    </svg>
  ),
};
const STEPS = [
  {
    number: '01',
    icon: '🖥️',
    color: 'from-indigo-500 to-violet-500',
    glow: 'rgba(99,102,241,0.25)',
    title: 'Start the Demo Server',
    description: 'Open a terminal in the project root and run this command to serve the demo pages over HTTP:',
    code: 'npx serve . -p 3000',
    note: 'Must be served via HTTP — not opened as a file:// URL',
  },
  {
    number: '02',
    icon: '🌐',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.25)',
    title: 'Open a Demo Page & Click Around',
    description: 'Open any demo page below in your browser. Every page load records a Page View. Every click records coordinates.',
    links: [
      { label: 'Home Page', url: 'http://localhost:3000/demo/index.html' },
      { label: 'Pricing Page', url: 'http://localhost:3000/demo/pricing.html' },
      { label: 'About Page', url: 'http://localhost:3000/demo/about.html' },
    ],
    note: 'Click buttons, cards, links — each click sends an event to the backend',
  },
  {
    number: '03',
    icon: '📊',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.25)',
    title: 'Come Back & See Your Data',
    description: 'Return to this dashboard and hit Refresh. Your sessions, page views, and click heatmaps will appear here instantly.',
    note: 'Dashboard auto-refreshes every 30 seconds',
  },
];
function GettingStartedGuide({ onDismiss }) {
  return (
    <div className="mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Quick Start Guide</h3>
            <p className="text-xs text-slate-400">Follow these 3 steps to start tracking</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="btn-ghost text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
          title="Hide this guide"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Hide
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {STEPS.map((step, idx) => (
          <div
            key={step.number}
            className="glass-card p-5 relative overflow-hidden group"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top left, ${step.glow}, transparent 70%)` }}
            />
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-card`}>
                <span className="text-lg">{step.icon}</span>
              </div>
              <span className={`text-xs font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent tracking-widest`}>
                STEP {step.number}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-2">{step.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">{step.description}</p>
            {step.code && (
              <div className="bg-surface rounded-lg px-3 py-2 mb-3 border border-card-border flex items-center justify-between gap-2 group/code">
                <code className="text-xs text-emerald-400 font-mono">{step.code}</code>
                <button
                  className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                  title="Copy command"
                  onClick={() => navigator.clipboard?.writeText(step.code)}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            )}
            {step.links && (
              <div className="space-y-1.5 mb-3">
                {step.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-brand-light hover:text-brand font-medium transition-colors group/link"
                  >
                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    <span className="truncate group-hover/link:underline">{link.label}</span>
                    <code className="text-slate-500 text-[10px] font-mono truncate hidden sm:block">
                      {link.url.replace('http://localhost:3000', '')}
                    </code>
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-start gap-1.5 mt-auto">
              <svg className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-[10px] text-slate-500 leading-relaxed">{step.note}</p>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-card border border-card-border items-center justify-center">
                <svg className="w-3 h-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-brand/10 border border-brand/20 rounded-xl flex items-center gap-3">
        <span className="text-lg flex-shrink-0">💡</span>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-brand-light">Tip:</strong> Open demo pages in multiple browser tabs and click around each one.
          Then check the <strong className="text-slate-200">Heatmap</strong> page — select any URL from the dropdown to see exactly where users clicked.
          The <strong className="text-slate-200">Sessions</strong> table shows all unique visitors.
        </p>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showGuide, setShowGuide] = useState(() => {
    return localStorage.getItem('_wa_guide_dismissed') !== 'true';
  });

  const handleDismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem('_wa_guide_dismissed', 'true');
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [statsData, sessionsData] = await Promise.all([
        fetchStats(),
        fetchSessions(),
      ]);
      setStats(statsData);
      setSessions(sessionsData.slice(0, 5));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const hasData = stats && stats.total_events > 0;
  if (error && !stats) {
    return (
      <div className="page-container">
        <EmptyState
          title="Failed to load data"
          message={error}
          icon={
            <svg className="w-12 h-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          action={<button className="btn-primary" onClick={loadData}>Try Again</button>}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <span className="text-gradient">Analytics Overview</span>
            {hasData && (
              <span className="dot-online ml-1" title="Live data" />
            )}
          </h2>
          <p className="section-subtitle">
            {lastUpdated
              ? `Last updated ${formatRelativeTime(lastUpdated)} · auto-refreshes every 30s`
              : 'Loading live data...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!showGuide && (
            <button
              className="btn-ghost text-xs"
              onClick={() => {
                setShowGuide(true);
                localStorage.removeItem('_wa_guide_dismissed');
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              How to use
            </button>
          )}
          <button className="btn-secondary" onClick={loadData} disabled={loading}>
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      {showGuide && <GettingStartedGuide onDismiss={handleDismissGuide} />}
      {!loading && !hasData && !showGuide && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center gap-3 animate-fade-in">
          <span className="text-xl flex-shrink-0">👆</span>
          <p className="text-sm text-amber-200">
            No tracking data yet. Click{' '}
            <button
              className="font-bold text-amber-300 underline underline-offset-2 hover:text-amber-100"
              onClick={() => {
                setShowGuide(true);
                localStorage.removeItem('_wa_guide_dismissed');
              }}
            >
              "How to use"
            </button>{' '}
            to get started.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          loading={loading}
          title="Total Sessions"
          value={stats?.total_sessions ?? 0}
          icon={Icons.sessions}
          gradient="bg-brand-gradient"
          subtitle="Unique visitors"
        />
        <StatCard
          loading={loading}
          title="Total Events"
          value={stats?.total_events ?? 0}
          icon={Icons.events}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          subtitle={`${stats?.events_last_24h ?? 0} in last 24h`}
        />
        <StatCard
          loading={loading}
          title="Page Views"
          value={stats?.page_views ?? 0}
          icon={Icons.pageViews}
          gradient="bg-success-gradient"
          subtitle="Tracked navigations"
        />
        <StatCard
          loading={loading}
          title="Click Events"
          value={stats?.clicks ?? 0}
          icon={Icons.clicks}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          subtitle="User interactions"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 glass-card p-6">
          <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-light" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Top Pages
          </h3>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
          ) : !stats?.top_pages?.length ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-3">📄</p>
              <p className="text-sm text-slate-500">No page views yet</p>
              <p className="text-xs text-slate-600 mt-1">Visit a demo page to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.top_pages.map((page, i) => {
                const maxViews = stats.top_pages[0]?.views || 1;
                const pct = Math.round((page.views / maxViews) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300 font-mono truncate max-w-[160px]" title={page.page_url}>
                        {formatUrl(page.page_url)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-2 flex-shrink-0">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-card rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gradient rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="xl:col-span-3 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Recent Sessions
            </h3>
            <button className="btn-ghost text-xs" onClick={() => navigate('/sessions')}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : !sessions.length ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-3">👤</p>
              <p className="text-sm text-slate-500">No sessions yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Open a demo page at{' '}
                <a href="http://localhost:3000/demo/index.html" target="_blank" rel="noopener noreferrer"
                  className="text-brand-light hover:underline font-mono text-[10px]">
                  localhost:3000/demo
                </a>
                {' '}to start tracking
              </p>
            </div>
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Events</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.session_id} onClick={() => navigate(`/sessions/${session.session_id}`)}>
                    <td>
                      <span className="truncate-id text-brand-light">{session.session_id}</span>
                    </td>
                    <td>
                      <span className="badge-indigo badge">{session.total_events}</span>
                    </td>
                    <td>
                      <span className="text-slate-400 text-xs">{formatRelativeTime(session.last_seen)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
