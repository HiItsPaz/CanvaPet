'use client';

import { SignUpForm } from '@/components/auth/SignUpForm';
import { AnimatedAuthContainer } from '@/components/auth/AnimatedAuthContainer';

export default function SignUpPage() {
  return (
    <main className="container flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-10">
      <AnimatedAuthContainer 
        title="Create an Account" 
        description="Sign up to get started with CanvaPet"
      >
        <SignUpForm />
      </AnimatedAuthContainer>
    </main>
  );
} 