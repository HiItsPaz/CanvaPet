import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Suspense } from 'react';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Reset Password</h1>
        <p className="mb-6 text-center text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        <Suspense fallback={<div>Loading form...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
} 