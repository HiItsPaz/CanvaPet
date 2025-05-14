'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AnimatedAuthContainer } from '@/components/auth/AnimatedAuthContainer';

export default function ForgotPasswordPage() {
  return (
    <main className="container flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-10">
      <AnimatedAuthContainer 
        title="Reset Password" 
        description="Enter your email address and we'll send you a link to reset your password"
      >
        <ForgotPasswordForm />
      </AnimatedAuthContainer>
    </main>
  );
} 