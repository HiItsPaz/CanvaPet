import { SignUpForm } from '@/components/auth/SignUpForm';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Create Account</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
} 