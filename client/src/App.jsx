import { Navigate, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Report from './pages/Report';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

function ChatsRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-headline text-2xl">Loading your celestial session...</div>;
  }

  return <Chat guestMode={!isAuthenticated} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/chats" element={<ChatsRoute />} />
      <Route path="/charts" element={<Navigate to="/chats" replace />} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/report/:chatId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
