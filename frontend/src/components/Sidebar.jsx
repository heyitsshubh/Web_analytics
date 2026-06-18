import { NavLink, useLocation } from 'react-router-dom';
const navItems = [
  {
    to: '/dashboard',
    label: 'Overview',
    icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 10a3.001 3.001 0 01-2 2.83V13a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
  },
  {
    to: '/sessions',
    label: 'Sessions',
    icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    to: '/heatmap',
    label: 'Heatmap',
    icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  },
];
export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col bg-surface-100 border-r border-card-border z-40">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow-brand flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-none">WebAnalytics</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Behavior Tracker</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="dot-online flex-shrink-0" />
          <span className="text-xs text-emerald-400 font-medium">Tracking Live</span>
        </div>
      </div>
      <div className="divider mx-4" />
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Navigation
        </p>

        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-light" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
