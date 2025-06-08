import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState.loading) {
    return <LoadingSpinner />;
  }

  if (!authState.user) {
    return <Navigate to="/login\" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}