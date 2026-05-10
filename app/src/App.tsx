import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DataList } from './pages/DataList';
import { UploadPage } from './pages/UploadPage';
import { TicketsPage } from './pages/TicketsPage';
import { FilesPage } from './pages/FilesPage';
import { AgentPage } from './pages/AgentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminSetupPage from './pages/AdminSetupPage';
import UserManagementPage from './pages/UserManagementPage';
import { authService } from './lib/authService';
import React, { useEffect } from 'react';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !authService.isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const isAuthPage = ['/login', '/register', '/setup'].includes(window.location.pathname);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const setupRequired = await authService.checkSetup();
        if (setupRequired && window.location.pathname !== '/setup') {
          navigate('/setup');
        }
      } catch (err) {
        console.error("Failed to check setup status", err);
      }
    };
    checkSetup();
  }, [navigate]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar />
      <main style={{
        marginLeft: '260px',
        flex: 1,
        padding: '2rem',
        maxWidth: 'calc(100vw - 260px)'
      }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/setup" element={<AdminSetupPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/data" element={<ProtectedRoute><DataList /></ProtectedRoute>} />
          <Route path="/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute><AgentPage /></ProtectedRoute>} />

          {/* Admin Only Routes */}
          <Route path="/users" element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
        </Routes>
      </AuthLayout>
    </Router>
  );
}

export default App;
