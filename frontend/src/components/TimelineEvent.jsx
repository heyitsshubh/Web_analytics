

const EVENT_CONFIG = {
  page_view: {
    label: 'Page View',
    dotClass: 'bg-emerald-500 shadow-glow-success',
    badgeClass: 'badge-emerald',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    ),
    cardClass: 'border-emerald-500/20 bg-emerald-500/5',
  },
  click: {
    label: 'Click Event',
    dotClass: 'bg-brand shadow-glow-brand',
    badgeClass: 'badge-indigo',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
      </svg>
    ),
    cardClass: 'border-brand/20 bg-brand/5',
  },
};
function formatTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Unknown time';
  }
}

function formatDate(timestamp) {
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}


export default function TimelineEvent({ event, isLast = false, index = 0 }) {
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.page_view;

  return (
    <div
      className="flex gap-4 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${config.dotClass} ring-4 ring-surface ring-offset-0`}
        />
        {!isLast && (
          <div className="timeline-line mt-1 flex-1" />
        )}
      </div>
      <div className={`flex-1 mb-4 glass-card p-4 border ${config.cardClass}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`badge ${config.badgeClass} gap-1`}>
              {config.icon}
              {config.label}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-medium text-slate-300">{formatTime(event.timestamp)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(event.timestamp)}</p>
          </div>
        </div>
        {event.event_type === 'page_view' && (
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <p
              className="text-sm text-slate-300 font-mono truncate max-w-xs"
              title={event.page_url}
            >
              {event.page_url}
            </p>
          </div>
        )}

        {event.event_type === 'click' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-slate-300 font-mono truncate" title={event.page_url}>
                {event.page_url}
              </p>
            </div>
            {event.metadata?.x !== null && event.metadata?.y !== null && (
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 bg-card rounded-lg px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">X</span>
                  <span className="text-sm font-mono font-semibold text-brand-light">
                    {event.metadata.x}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-card rounded-lg px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Y</span>
                  <span className="text-sm font-mono font-semibold text-violet-400">
                    {event.metadata.y}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
