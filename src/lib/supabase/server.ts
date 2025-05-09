import { cookies } from 'next/headers';
import { createServerClient as createServerClientBase, type CookieOptions } from '@supabase/ssr';

/**
 * Create a Supabase client for server-side operations with cookie management
 */
export function createServerClient() {
  const cookieStore = cookies();
  
  return createServerClientBase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This will throw in middleware, but we can ignore it
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This will throw in middleware, but we can ignore it
          }
        },
      },
    }
  );
} 