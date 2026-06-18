import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import SessionsPage from './pages/SessionsPage';
import UserJourneyPage from './pages/UserJourneyPage';
import HeatmapPage from './pages/HeatmapPage';

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Routes wrapped in Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"                element={<OverviewPage />} />
          <Route path="/sessions"                 element={<SessionsPage />} />
          <Route path="/sessions/:sessionId"      element={<UserJourneyPage />} />
          <Route path="/heatmap"                  element={<HeatmapPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
