import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import AppPage from './pages/AppPage';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { isLoggedIn, isGuest } = useAuth();
  return isLoggedIn || isGuest ? children : <Navigate to="/" replace />;
}

function RootRedirect() {
  const { isLoggedIn, isGuest } = useAuth();
  return isLoggedIn || isGuest ? <Navigate to="/app" replace /> : <Home />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
