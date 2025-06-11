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

  // 認証状態が読み込み中の場合のみローディングを表示
  if (authState.loading) {
    console.log('ProtectedRoute: 認証状態が読み込み中');
    return <LoadingSpinner />;
  }

  // 認証されていない場合はログインページにリダイレクト
  if (!authState.user) {
    console.log('ProtectedRoute: 未認証のためログインページにリダイレクト');
    return <Navigate to="/login\" state={{ from: location }} replace />;
  }

  // 認証済みの場合は子コンポーネントを表示
  console.log('ProtectedRoute: 認証済み、アプリケーションを表示');
  return <>{children}</>;
}