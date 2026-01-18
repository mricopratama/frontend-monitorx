import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '../protected-route';
import { useRouter, usePathname } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock auth context
vi.mock('@/lib/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const mockPush = vi.fn();
  const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
  const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('should show loading spinner while authentication is loading', () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Loading spinner
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=%2Fdashboard');
    });
  });

  it('should render children when authenticated', () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should use custom redirectTo prop', async () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    render(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login?returnUrl=%2Fdashboard');
    });
  });

  it('should redirect authenticated users away from public pages', async () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    render(
      <ProtectedRoute requiredAuth={false}>
        <div>Login Page</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should render public pages for unauthenticated users', () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    render(
      <ProtectedRoute requiredAuth={false}>
        <div>Login Page</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should save current path for redirect after login', async () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    
    mockUsePathname.mockReturnValue('/dashboard/websites/123');

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('returnUrl=%2Fdashboard%2Fwebsites%2F123')
      );
    });
  });

  it('should not redirect when authentication status changes', () => {
    const { useAuth } = require('@/lib/contexts/auth-context');
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();

    // Change auth state
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should redirect now
    expect(mockPush).toHaveBeenCalled();
  });
});
