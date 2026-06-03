import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnalyticsPage from '../pages/AnalyticsPage.jsx';
import CommentsPage from '../pages/CommentsPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import IssueDetailPage from '../pages/IssueDetailPage.jsx';
import IssuesPage from '../pages/IssuesPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ProjectsPage from '../pages/ProjectsPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import SyncPage from '../pages/SyncPage.jsx';

function ProtectedRoute({ children }) {
  const auth = useAuth();
  if (!auth.ready) {
    return null;
  }
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

  const canManageAnalytics = auth.user?.role === 'admin' || auth.user?.role === 'manager';

  return (
    <header className="app-header">
      <div>
        <Link className="site-title" to="/dashboard">
          FA SEM Tracker
        </Link>
      </div>
      <nav className="app-nav">
        {auth.token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/users">Users</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/issues">Issues</Link>
            <Link to="/comments">Comments</Link>
            <Link to="/profile">Profile</Link>
            {canManageAnalytics && <Link to="/analytics">Analytics</Link>}
            {canManageAnalytics && <Link to="/sync">Sync</Link>}
            <button
              type="button"
              className="secondary"
              onClick={() => {
                auth.logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default function AppRouter() {
  const auth = useAuth();

  return (
    <BrowserRouter>
      <Header />
      <main className="page-content">
        <Routes>
          <Route path="/" element={auth.token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <IssuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute>
                <IssueDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comments"
            element={
              <ProtectedRoute>
                <CommentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sync"
            element={
              <ProtectedRoute>
                <SyncPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
