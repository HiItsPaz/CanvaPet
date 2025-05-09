'use client';

import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Min 1 to ensure it's not empty
});

type SignInFormValues = z.infer<typeof formSchema>;

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: SignInFormValues) {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message === 'Email not confirmed') {
        setError(
          'Your email address has not been confirmed. Please check your inbox for a verification email.'
        );
      } else if (signInError.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(signInError.message);
      }
    } else {
      // Successful login
      // Supabase client handles session. Redirect to a protected route.
      // For now, let's assume a dashboard page, replace with your actual route
      router.push('/dashboard'); 
      // router.refresh(); // To ensure server components re-render with new auth state if needed
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
           <Alert variant="destructive">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: ControllerRenderProps<SignInFormValues, 'email'> }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }: { field: ControllerRenderProps<SignInFormValues, 'password'> }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-sm">
          <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </Form>
  );
} 