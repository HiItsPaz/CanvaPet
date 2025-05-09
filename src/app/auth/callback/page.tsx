'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The Supabase client automatically handles the session from the URL hash
    // when the page loads. We just need to check the session status.
    const checkSession = async () => {
      // supabase.auth.onAuthStateChange will fire, but we can also explicitly get the session
      // The URL fragment (hash) contains the access_token, etc.
      // Supabase JS client should automatically handle this and store the session.

      // Give a moment for the Supabase client to process the hash
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError('Could not process authentication. Please try again.');
        setMessage('');
        return;
      }
      
      if (session && session.user) {
        // Check if the user's email is confirmed
        // This check might be redundant if Supabase only redirects here after confirmation,
        // but it's a good safeguard.
        if (session.user.email_confirmed_at || (session.user.new_email && !session.user.email)) {
          // If new_email is set and email is null, it means email change is pending confirmation
          // For initial signup, session.user.email_confirmed_at should be set.
          setMessage(
            'Your email has been verified successfully! You will be redirected to sign in shortly.'
          );
          setTimeout(() => {
            router.push('/auth/signin');
          }, 3000);
        } else {
           // This case should ideally not happen if emailRedirectTo is used correctly
           // for email verification callback.
          setMessage(
            'Verification processed, but email not yet confirmed in session. Redirecting to sign in...'
          );
          setError('Please check your email or try signing in.')
          setTimeout(() => {
            router.push('/auth/signin');
          }, 5000);
        }
      } else {
        // No active session found after callback
        setMessage('Could not verify email or session expired.');
        setError('Please try signing up again or contact support if the issue persists.');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Authentication Callback</h1>
        {message && <p className="text-gray-700 dark:text-gray-300">{message}</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!error && !message && <p>Processing...</p>} 
        <div className="mt-6">
            <Link href="/auth/signin" className="text-blue-600 hover:underline dark:text-blue-400">
                Go to Sign In
            </Link>
        </div>
      </div>
    </div>
  );
} 