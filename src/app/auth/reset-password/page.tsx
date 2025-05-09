import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Set New Password</h1>
        <p className="mb-6 text-center text-muted-foreground">
          Please create a new password for your account.
        </p>
        <Suspense fallback={<div>Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
} 