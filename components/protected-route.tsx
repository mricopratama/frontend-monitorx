/**
 * Protected Route Middleware
 * Higher-order component to protect routes that require authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (requiredAuth && !isAuthenticated) {
        // Save current path to redirect back after login
        const returnUrl = encodeURIComponent(pathname);
        router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      } else if (!requiredAuth && isAuthenticated) {
        // User is already authenticated, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, requiredAuth, redirectTo, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if auth requirement not met
  if (requiredAuth && !isAuthenticated) {
    return null;
  }

  if (!requiredAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
