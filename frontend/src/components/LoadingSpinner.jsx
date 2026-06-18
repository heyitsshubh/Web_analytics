/**
 * LoadingSpinner Component
 * =========================
 * Centered full-area spinner with optional message.
 *
 * Props:
 *  - message {string} Optional text below spinner
 *  - size    {'sm'|'md'|'lg'} Spinner size (default: 'md')
 *  - fullPage {boolean} If true, takes full viewport height
 */

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
};

export default function LoadingSpinner({
  message = 'Loading data...',
  size = 'md',
  fullPage = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullPage ? 'min-h-screen' : 'py-20'
      } animate-fade-in`}
    >
      {/* Spinner rings */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={`${sizeMap[size]} rounded-full border-brand/20 border-solid`}
        />
        {/* Spinning ring */}
        <div
          className={`absolute inset-0 ${sizeMap[size]} rounded-full border-brand border-t-transparent animate-spin`}
        />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-slate-400 font-medium">{message}</p>
      )}
    </div>
  );
}
