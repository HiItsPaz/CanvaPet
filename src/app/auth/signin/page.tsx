import { SignInForm } from '@/components/auth/SignInForm';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Sign In</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
} 