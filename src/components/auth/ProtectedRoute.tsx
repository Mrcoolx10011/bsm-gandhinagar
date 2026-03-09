import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { checkAuth } = useAuthStore();

  // Synchronous check — eliminates flash of admin content for expired tokens.
  // checkAuth() reads localStorage and updates Zustand state in one pass.
  const isAuth = checkAuth();

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};