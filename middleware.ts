import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Define routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/projects',
  '/settings',
];

// Define routes that should redirect authenticated users (e.g., login page)
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
];

export async function middleware(req: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next();
  
  // Create a Supabase client configured for SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          // Update the response cookies for client-side use
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          // Update the response cookies for client-side use
          req.cookies.delete({
            name,
            ...options,
          });
          res.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if it exists
  const { data: { session } } = await supabase.auth.getSession();

  // Get the pathname from the URL
  const path = req.nextUrl.pathname;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path === route);

  // If it's a protected route and no session exists, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', req.url);
    // Add the original URL as a query parameter to redirect back after login
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If it's an auth route and session exists, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // For all other routes, proceed normally
  return res;
}

// Configure the middleware to run only on specific routes
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 