import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import OverviewPage from './pages/OverviewPage';
import SessionsPage from './pages/SessionsPage';
import UserJourneyPage from './pages/UserJourneyPage';
import HeatmapPage from './pages/HeatmapPage';

/**
 * Root App component.
 * Sets up React Router with a persistent sidebar layout.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-surface">
        {/* ── Sidebar Navigation ── */}
        <Sidebar />

        {/* ── Main Content Area ── */}
        <main className="flex-1 ml-64 overflow-auto min-h-screen">
          <Routes>
            <Route path="/"                         element={<OverviewPage />} />
            <Route path="/sessions"                 element={<SessionsPage />} />
            <Route path="/sessions/:sessionId"      element={<UserJourneyPage />} />
            <Route path="/heatmap"                  element={<HeatmapPage />} />
            {/* Catch-all redirect */}
            <Route path="*"                         element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
