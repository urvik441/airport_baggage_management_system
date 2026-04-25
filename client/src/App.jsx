import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import RoomPage from './pages/RoomPage';
import ChatPage from './pages/ChatPage';
import WalletPage from './pages/WalletPage';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AutoRedirect = () => {
  const { user, pendingRedirect, setPendingRedirect } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && pendingRedirect) {
      const target = pendingRedirect;
      setPendingRedirect(null);
      navigate(target);
    }
  }, [user, pendingRedirect, navigate, setPendingRedirect]);

  return null;
};

const AdminRoute = ({ children }) => {
  const { user } = useAppContext();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAppContext();
  
  if (!user) return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AutoRedirect />
        <AppLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/room" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
            <Route path="/chat/:roomId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
}

export default App;
