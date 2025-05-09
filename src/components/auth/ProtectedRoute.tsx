'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Only redirect after we've confirmed there's no user (not while loading)
      router.push(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // While loading authentication, show a skeleton loader
  if (loading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-md" />
            <Skeleton className="h-48 rounded-md" />
            <Skeleton className="h-48 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // If not loading and no user, show a message
  // (this will briefly show before redirect happens)
  if (!user) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access this page.
            <div className="mt-2">
              <Link href="/auth/signin" className="font-medium underline">
                Sign in now
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
} 