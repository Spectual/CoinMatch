import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MissingCoinsPage = lazy(() => import('./pages/MissingCoinsPage'));
const CoinDetailPage = lazy(() => import('./pages/CoinDetailPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const MatchHistoryPage = lazy(() => import('./pages/MatchHistoryPage'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading CoinMatch...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="missing-coins" element={<MissingCoinsPage />} />
          <Route path="coin/:id" element={<CoinDetailPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="comparison/:candidateId" element={<ComparisonPage />} />
          <Route path="history" element={<MatchHistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Checking credentials…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}
