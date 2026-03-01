import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { uiMessages } from '../../utils/uiMessages';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">{uiMessages.common.loading}</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children ? <>{children}</> : <Outlet />;
};
