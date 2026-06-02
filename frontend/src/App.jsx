import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

// PROTECTED ROUTE BOUNDARY MIDDLEWARE
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center flex-col gap-4 select-none">
        <div className="w-12 h-12 rounded-full border-t-2 border-t-neon-purple border-r-2 border-r-neon-cyan animate-spin" />
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider font-title">
          Syncing BTech session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      {/* React Hot Toast Configuration */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'glass-panel !border-white/10 !bg-slate-900 !text-white text-xs font-semibold !rounded-xl !shadow-2xl',
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' }
          }
        }}
      />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Core Protected Workspace Portals */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/event/:id" element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <AppRoutes />
      </EventProvider>
    </AuthProvider>
  );
}
