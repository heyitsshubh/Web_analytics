/**
 * Heatmap Page
 * =============
 * Visualizes click event density for a selected page URL.
 *
 * Features:
 *  - URL select dropdown (from API) + manual URL input
 *  - Normalized click dot overlay on a webpage canvas
 *  - Color intensity based on click density (blue → red)
 *  - Click count stats, legend, and export info
 *
 * Route: /heatmap
 */

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { fetchHeatmapData, fetchHeatmapPages } from '../api/analytics';

/* ─────────────────────── Colour Scale ──────────────────────────────── */

/**
 * Maps a normalised intensity (0→1) to an HSLA colour.
 * Low intensity → cool blue. High intensity → hot red.
 */
function intensityToColor(intensity) {
  // HSL: 240 (blue) → 0 (red)
  const hue = (1 - intensity) * 240;
  const opacity = 0.25 + intensity * 0.55; // range 0.25–0.8
  return `hsla(${hue}, 90%, 60%, ${opacity})`;
}

function intensityToGlow(intensity) {
  const hue = (1 - intensity) * 240;
  return `hsla(${hue}, 90%, 60%, 0.4)`;
}

/* ─────────────────────── Dot size scale ────────────────────────────── */

function dotSize(intensity) {
  return 14 + Math.round(intensity * 24); // 14px – 38px
}

/* ─────────────────────── Density grouping ───────────────────────────── */

/**
 * Groups nearby clicks into cells and computes the max count per cell
 * to normalise intensities.
 */
function computeIntensities(points, containerW, containerH, sourceW, sourceH, cellSize = 40) {
  const cells = {};

  points.forEach(({ x, y }) => {
    // Scale original coordinates to container
    const cx = Math.round(((x / sourceW) * containerW) / cellSize) * cellSize;
    const cy = Math.round(((y / sourceH) * containerH) / cellSize) * cellSize;
    const key = `${cx},${cy}`;
    cells[key] = (cells[key] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(cells), 1);

  // Map each original point to its cell intensity
  return points.map(({ x, y, timestamp }) => {
    const scaledX = (x / sourceW) * containerW;
    const scaledY = (y / sourceH) * containerH;
    const cellX = Math.round(scaledX / cellSize) * cellSize;
    const cellY = Math.round(scaledY / cellSize) * cellSize;
    const count = cells[`${cellX},${cellY}`] || 1;
    return {
      x: scaledX,
      y: scaledY,
      intensity: count / maxCount,
      count,
      timestamp,
    };
  });
}

/* ─────────────────────── Component ─────────────────────────────────── */

export default function HeatmapPage() {
  const containerRef = useRef(null);

  const [pages, setPages] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [error, setError] = useState(null);

  const [containerSize, setContainerSize] = useState({ w: 960, h: 540 });

  // Source viewport assumptions (typical desktop)
  const SOURCE_W = 1280;
  const SOURCE_H = 800;

  /* ── Load available pages ── */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchHeatmapPages();
        setPages(data);
        if (data.length) setSelectedUrl(data[0]);
      } catch {
        // Non-critical; user can still type a URL manually
      } finally {
        setPagesLoading(false);
      }
    };
    load();
  }, []);

  /* ── Track container size ── */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Fetch heatmap data ── */
  const loadHeatmap = useCallback(async () => {
    const url = useCustom ? customUrl.trim() : selectedUrl;
    if (!url) return;

    try {
      setError(null);
      setLoading(true);
      const result = await fetchHeatmapData(url);
      setHeatmapData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [useCustom, customUrl, selectedUrl]);

  /* ── Computed dots with intensity ── */
  const dots = useMemo(() => {
    if (!heatmapData?.data?.length) return [];
    return computeIntensities(
      heatmapData.data,
      containerSize.w,
      containerSize.h,
      SOURCE_W,
      SOURCE_H
    );
  }, [heatmapData, containerSize]);

  const clickCount = heatmapData?.count ?? 0;
  const maxIntensity = dots.length ? Math.max(...dots.map((d) => d.intensity)) : 0;

  /* ── Active URL ── */
  const activeUrl = useCustom ? customUrl : selectedUrl;

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <h2 className="section-title text-gradient">Click Heatmap</h2>
          <p className="section-subtitle">
            Visualize where users click on your pages
          </p>
        </div>
        {heatmapData && (
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-xl">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-sm text-slate-300 font-medium">
              {clickCount.toLocaleString()} click{clickCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── URL Selector Card ── */}
      <div className="glass-card p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Toggle: dropdown vs custom */}
          <div className="flex gap-2">
            <button
              className={`btn text-sm px-4 py-2 ${!useCustom ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setUseCustom(false)}
            >
              Select Page
            </button>
            <button
              className={`btn text-sm px-4 py-2 ${useCustom ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setUseCustom(true)}
            >
              Custom URL
            </button>
          </div>

          {/* URL Input */}
          <div className="flex-1 flex gap-3">
            {useCustom ? (
              <input
                id="heatmap-custom-url"
                type="url"
                className="input"
                placeholder="https://example.com/page"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadHeatmap()}
              />
            ) : (
              <select
                id="heatmap-page-select"
                className="input"
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                disabled={pagesLoading || !pages.length}
              >
                {pagesLoading && <option>Loading pages...</option>}
                {!pagesLoading && !pages.length && (
                  <option value="">No pages with click data</option>
                )}
                {pages.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}

            <button
              id="heatmap-load-btn"
              className="btn-primary flex-shrink-0"
              onClick={loadHeatmap}
              disabled={loading || !activeUrl}
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              )}
              Generate Heatmap
            </button>
          </div>
        </div>

        {/* Active URL chip */}
        {activeUrl && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <span className="font-mono truncate">{activeUrl}</span>
          </div>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* ── Heatmap Canvas ── */}
      <div className="glass-card overflow-hidden">
        {/* Canvas header */}
        <div className="px-5 py-3 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="ml-2 text-xs text-slate-500 font-mono truncate max-w-xs">
              {activeUrl || 'Select a URL to visualize'}
            </span>
          </div>
          {heatmapData && (
            <span className="text-xs text-slate-500">
              {clickCount} data point{clickCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          id="heatmap-container"
          className="relative w-full bg-slate-900/50"
          style={{ height: '540px' }}
        >
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface/80 backdrop-blur-sm">
              <LoadingSpinner message="Generating heatmap..." />
            </div>
          )}

          {/* Empty / initial state */}
          {!loading && !heatmapData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState
                title="No heatmap generated yet"
                message="Select a page URL above and click 'Generate Heatmap' to visualize click data."
                icon={
                  <svg className="w-14 h-14 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
              />
            </div>
          )}

          {/* No clicks for this URL */}
          {!loading && heatmapData && clickCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState
                title="No clicks recorded"
                message={`No click events found for this URL. Make sure tracker.js is embedded on this page.`}
                icon={
                  <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                }
              />
            </div>
          )}

          {/* Webpage wireframe overlay */}
          {!loading && heatmapData && clickCount > 0 && (
            <>
              {/* Subtle page wireframe guides */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                {/* Nav bar */}
                <div className="h-12 bg-slate-400 mx-4 mt-4 rounded-lg" />
                {/* Hero */}
                <div className="h-32 bg-slate-500 mx-4 mt-3 rounded-lg" />
                {/* Content grid */}
                <div className="grid grid-cols-3 gap-3 mx-4 mt-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-500 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Click Dots */}
              {dots.map((dot, i) => {
                const size = dotSize(dot.intensity);
                const color = intensityToColor(dot.intensity);
                const glow = intensityToGlow(dot.intensity);
                return (
                  <div
                    key={i}
                    className="heatmap-dot"
                    title={`Click at (${Math.round((dot.x / containerSize.w) * SOURCE_W)}, ${Math.round((dot.y / containerSize.h) * SOURCE_H)})`}
                    style={{
                      left: `${dot.x}px`,
                      top: `${dot.y}px`,
                      width: `${size}px`,
                      height: `${size}px`,
                      background: `radial-gradient(circle, ${color} 0%, transparent 100%)`,
                      filter: `blur(${2 + dot.intensity * 4}px)`,
                      boxShadow: dot.intensity > 0.5 ? `0 0 ${size}px ${glow}` : 'none',
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Legend + Stats ── */}
      {heatmapData && clickCount > 0 && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
          {/* Legend */}
          <div className="glass-card p-5">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Click Intensity Legend</h4>
            <div className="flex items-center gap-1 h-5 rounded-full overflow-hidden">
              {[...Array(20)].map((_, i) => {
                const intensity = i / 19;
                return (
                  <div
                    key={i}
                    className="flex-1 h-full"
                    style={{
                      background: intensityToColor(intensity).replace(/[\d.]+\)$/, '0.85)'),
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-slate-500">Low activity</span>
              <span className="text-xs text-slate-500">High activity</span>
            </div>
          </div>

          {/* Click stats */}
          <div className="glass-card p-5">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Heatmap Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-slate-100">{clickCount}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total clicks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  {dots.length ? Math.round(maxIntensity * 100) : 0}%
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Peak intensity</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
