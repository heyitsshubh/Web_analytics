

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { fetchSessions } from '../api/analytics';

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: true,
    });
  } catch { return '—'; }
}

function formatRelative(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function sessionDuration(first, last) {
  if (!first || !last) return '—';
  const diff = new Date(last) - new Date(first);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}


export default function SessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('last_seen');
  const [sortDir, setSortDir] = useState('desc');

  const loadSessions = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);
  const displayed = useMemo(() => {
    let list = sessions.filter((s) =>
      s.session_id.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'first_seen' || sortKey === 'last_seen') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [sessions, search, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };
  const SortIcon = ({ col }) => {
    if (sortKey !== col) {
      return (
        <svg className="w-3 h-3 text-slate-600 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zm10-4a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414L15 13.586V8z" />
        </svg>
      );
    }
    return sortDir === 'asc' ? (
      <svg className="w-3 h-3 text-brand-light ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-brand-light ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };
  const ColHeader = ({ col, label }) => (
    <th
      className="cursor-pointer select-none hover:text-slate-200 transition-colors"
      onClick={() => toggleSort(col)}
    >
      <span className="flex items-center">
        {label}
        <SortIcon col={col} />
      </span>
    </th>
  );

  if (loading) return <LoadingSpinner fullPage message="Loading sessions..." />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title text-gradient">Sessions</h2>
          <p className="section-subtitle">
            {sessions.length} unique sessions tracked
          </p>
        </div>
        <button className="btn-secondary" onClick={loadSessions}>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}
      <div className="mb-6 relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          id="session-search"
          type="text"
          className="input pl-10"
          placeholder="Search sessions by ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {!sessions.length ? (
        <div className="glass-card p-8">
          <EmptyState
            title="No sessions yet"
            message="Embed tracker.js on any webpage to start tracking user sessions."
          />
        </div>
      ) : !displayed.length ? (
        <div className="glass-card p-8">
          <EmptyState
            title="No matching sessions"
            message={`No sessions match "${search}". Try a different search term.`}
          />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="w-8 pl-4">#</th>
                  <ColHeader col="session_id" label="Session ID" />
                  <ColHeader col="total_events" label="Events" />
                  <th>Page Views</th>
                  <th>Clicks</th>
                  <th>Unique Pages</th>
                  <ColHeader col="first_seen" label="First Seen" />
                  <ColHeader col="last_seen" label="Last Activity" />
                  <th>Duration</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {displayed.map((session, idx) => (
                  <tr
                    key={session.session_id}
                    onClick={() => navigate(`/sessions/${session.session_id}`)}
                    title="Click to view user journey"
                  >
                    <td className="pl-4">
                      <span className="text-xs text-slate-500 font-medium">{idx + 1}</span>
                    </td>
                    <td>
                      <span className="truncate-id text-brand-light">
                        {session.session_id}
                      </span>
                    </td>
                    <td>
                      <span className="badge-violet badge">{session.total_events}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-slate-300">{session.page_views}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-light" />
                        <span className="text-slate-300">{session.clicks}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-cyan badge">{session.unique_pages}</span>
                    </td>
                    <td>
                      <span className="text-slate-400 text-xs">
                        {formatDateTime(session.first_seen)}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-300 text-xs font-medium">
                        {formatRelative(session.last_seen)}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-400 text-xs font-mono">
                        {sessionDuration(session.first_seen, session.last_seen)}
                      </span>
                    </td>
                    <td>
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-brand-light" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-card-border flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="text-slate-300 font-medium">{displayed.length}</span> of{' '}
              <span className="text-slate-300 font-medium">{sessions.length}</span> sessions
            </p>
            {search && (
              <button className="text-xs text-brand-light hover:text-brand" onClick={() => setSearch('')}>
                Clear search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
