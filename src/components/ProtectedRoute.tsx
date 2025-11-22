import React from 'react';
import { UserRole } from '../types/types';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

/**
 * ProtectedRoute component for role-based access control
 * Wraps content that should only be accessible to authenticated users
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback,
  onUnauthorized,
}) => {
  const { currentUser, isAuthenticated } = useStore();

  // Not authenticated
  if (!isAuthenticated || !currentUser) {
    onUnauthorized?.();
    return fallback ? <>{fallback}</> : <UnauthorizedMessage message="Please log in to access this content." />;
  }

  // Check role permissions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.role)) {
      return fallback ? <>{fallback}</> : <UnauthorizedMessage message="You don't have permission to access this content." />;
    }
  }

  return <>{children}</>;
};

// Simple unauthorized message component
const UnauthorizedMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
      <span className="material-symbols-outlined text-3xl text-red-600">
        lock
      </span>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
    <p className="text-gray-500 text-center max-w-md">{message}</p>
  </div>
);

/**
 * Higher-order component version for class components or when needed
 */
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) => {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

/**
 * Hook for checking auth status and permissions in components
 */
export const useAuth = () => {
  const { currentUser, isAuthenticated } = useStore();

  const hasRole = (role: UserRole): boolean => {
    return isAuthenticated && currentUser?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return isAuthenticated && currentUser !== null && roles.includes(currentUser.role);
  };

  const isAdmin = hasRole(UserRole.ADMIN);
  const isSupplier = hasRole(UserRole.SUPPLIER);
  const isClient = hasRole(UserRole.CLIENT);

  return {
    currentUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSupplier,
    isClient,
  };
};

export default ProtectedRoute;
