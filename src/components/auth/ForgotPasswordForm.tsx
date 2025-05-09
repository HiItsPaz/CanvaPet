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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Terminal } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Get the base URL for the reset link
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const resetPasswordURL = `${origin}/auth/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: resetPasswordURL,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
      form.reset();
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">Password Reset Email Sent</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
          <div className="mt-4">
            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
              Return to sign in
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
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
          render={({ field }: { field: ControllerRenderProps<ForgotPasswordFormValues, 'email'> }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <div className="mt-4 text-center text-sm">
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </Form>
  );
} 