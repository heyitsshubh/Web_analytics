/**
 * StatCard Component
 * ===================
 * Reusable metric card for the overview dashboard.
 * Displays an icon, value, label, and optional trend indicator.
 *
 * Props:
 *  - title     {string}       Card label
 *  - value     {string|number} Main metric value
 *  - icon      {ReactNode}    Icon element
 *  - gradient  {string}       Tailwind gradient class for icon background
 *  - trend     {string}       Optional trend text (e.g. "+12% vs yesterday")
 *  - trendUp   {boolean}      true = green trend, false = red trend
 *  - loading   {boolean}      Show skeleton shimmer
 *  - subtitle  {string}       Optional subtitle under value
 */

export default function StatCard({
  title,
  value,
  icon,
  gradient = 'bg-brand-gradient',
  trend,
  trendUp = true,
  loading = false,
  subtitle,
}) {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="skeleton h-10 w-10 rounded-xl mb-4" />
        <div className="skeleton h-8 w-24 mb-2" />
        <div className="skeleton h-4 w-32" />
      </div>
    );
  }

  return (
    <div className="stat-card group">
      {/* Background glow on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none ${gradient}`}
        style={{ opacity: 0, filter: 'blur(40px)', transform: 'scale(0.8)' }}
      />

      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center mb-4 shadow-card flex-shrink-0`}
      >
        <span className="text-white w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p className="text-3xl font-bold text-slate-100 tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      {/* Trend badge */}
      {trend && (
        <div className="mt-3 pt-3 border-t border-card-border">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              trendUp ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trendUp ? (
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
