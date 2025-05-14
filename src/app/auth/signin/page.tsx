'use client';

import { SignInForm } from '@/components/auth/SignInForm';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatedAuthContainer } from '@/components/auth/AnimatedAuthContainer';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAccountDeletedMessage, setShowAccountDeletedMessage] = useState(false);
  
  useEffect(() => {
    // Check for deleted=true in query parameters
    if (searchParams.get('deleted') === 'true') {
      setShowAccountDeletedMessage(true);
    }
  }, [searchParams]);
  
  return (
    <main className="container flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-10">
      <AnimatedAuthContainer 
        title="Welcome Back" 
        description="Sign in to your account to continue"
      >
        <SignInForm />
        
        {showAccountDeletedMessage && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200">
            Your account has been successfully deleted. We're sad to see you go! You can always create a new account if you wish to return.
          </div>
        )}
      </AnimatedAuthContainer>
    </main>
  );
} 