
const DefaultIcon = () => (
  <svg
    className="w-12 h-12 text-slate-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

export default function EmptyState({
  icon,
  title = 'No data found',
  message = 'Nothing to display here yet.',
  action,
}) {
  return (
    <div className="empty-state animate-fade-in">
      {/* Glow background */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-card border border-card-border flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-brand/5" />
          {icon || <DefaultIcon />}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{message}</p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
