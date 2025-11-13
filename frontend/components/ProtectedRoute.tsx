'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  loadingComponent?: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  roles = [],
  loadingComponent = <LoadingSpinner />,
  redirectTo = '/signin',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '';

  useEffect(() => {
    if (loading) return;

    const isAuthorized = !roles.length || (user?.role && roles.includes(user.role));
    
    if (!user) {
      // Not logged in, redirect to signin with return URL
      const url = new URL(redirectTo, window.location.origin);
      if (pathname !== '/signin') {
        url.searchParams.set('returnUrl', pathname);
      }
      router.replace(url.toString());
    } else if (!isAuthorized) {
      // Logged in but not authorized for this role
      router.replace('/unauthorized');
    }
  }, [user, loading, roles, router, pathname, redirectTo]);

  if (loading) {
    return <>{loadingComponent}</>;
  }

  const isAuthorized = !roles.length || (user?.role && roles.includes(user.role));
  
  if (!user || !isAuthorized) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
}

export function withAuth(
  Component: React.ComponentType<any>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function WithAuthWrapper(props: any) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
