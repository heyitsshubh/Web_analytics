import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-card-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-brand">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100">WebAnalytics</h1>
        </div>
        <div className="flex gap-4">
          <a href="http://localhost:3000/demo/index.html" target="_blank" rel="noreferrer" className="btn-outline px-4 py-2 text-sm">
            View Demo Pages
          </a>
          <button onClick={() => navigate('/dashboard')} className="btn-primary px-4 py-2 text-sm">
            Open Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-bold mb-8 uppercase tracking-widest relative z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
          Live Tracking System
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-100 mb-6 leading-tight relative z-10 max-w-4xl">
          Understand your users with <br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            powerful visual analytics.
          </span>
        </h2>

        <p className="text-lg text-slate-400 max-w-2xl mb-12 relative z-10">
          A production-ready Web Analytics platform that tracks page views, click coordinates, user journeys, and heatmaps in real-time.
        </p>

        {/* Getting Started Guide */}
        <div className="glass-card max-w-3xl w-full p-8 text-left relative z-10 border-brand/30 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-3 mb-6 border-b border-card-border pb-4">
            <span className="text-2xl">👋</span>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Welcome! Here's how to test this project:</h3>
              <p className="text-sm text-slate-400">Follow these 3 steps to generate data and see the dashboard in action.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-500/30">1</div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Start the Demo Server</h4>
                <p className="text-sm text-slate-400 mb-2">Open a terminal in the project root and run this command to serve the demo site over HTTP:</p>
                <div className="bg-surface rounded border border-card-border px-3 py-2 text-xs font-mono text-emerald-400">
                  npx serve . -p 3000
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold flex-shrink-0 border border-violet-500/30">2</div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Go to the Demo Page & Click Around</h4>
                <p className="text-sm text-slate-400 mb-3">You must visit the demo page first. The tracking script is embedded there. Click buttons and links to generate data.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="http://localhost:3000/demo/index.html" target="_blank" rel="noreferrer" className="btn-outline px-4 py-2 text-xs flex items-center gap-2">
                    <span>🏠</span> Home Page
                  </a>
                  <a href="http://localhost:3000/demo/pricing.html" target="_blank" rel="noreferrer" className="btn-outline px-4 py-2 text-xs flex items-center gap-2">
                    <span>💰</span> Pricing Page
                  </a>
                  <a href="http://localhost:3000/demo/about.html" target="_blank" rel="noreferrer" className="btn-outline px-4 py-2 text-xs flex items-center gap-2">
                    <span>👥</span> About Page
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-500/30">3</div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">View the Dashboard</h4>
                <p className="text-sm text-slate-400 mb-3">After generating data on the demo pages, click below to enter the analytics dashboard and view the results.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2.5 shadow-glow-brand flex items-center gap-2 w-full sm:w-auto justify-center">
                  Enter Dashboard
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border py-6 text-center text-sm text-slate-500">
        <p>Built as a Full Stack Web Analytics Assignment</p>
      </footer>
    </div>
  );
}
