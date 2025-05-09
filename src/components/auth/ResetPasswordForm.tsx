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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Terminal } from "lucide-react";

const formSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have the auth recovery token in the URL hash
    // Supabase client handles this automatically, but we can verify the session
    const checkToken = async () => {
      const { data } = await supabase.auth.getSession();
      
      // If we have a session and we're on the reset password page,
      // we can assume the token is valid (Supabase SDK handles token validation)
      if (data && data.session) {
        setValidToken(true);
      } else {
        // If we don't have a session, the token might be invalid, expired,
        // or not present in the URL
        setValidToken(false);
        setError('The password reset link is invalid or has expired. Please request a new one.');
      }
    };

    checkToken();
  }, []);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      form.reset();
      
      // Redirect to sign in page after a delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 5000);
    }
  }

  if (validToken === false) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Invalid Reset Link</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-4">
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
              Request a new password reset link
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">Password Updated Successfully</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          Your password has been changed successfully. You will be redirected to the sign-in page in 5 seconds.
          <div className="mt-4">
            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
              Sign in now
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (validToken === null) {
    return <div>Verifying your reset link...</div>;
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
          name="password"
          render={({ field }: { field: ControllerRenderProps<ResetPasswordFormValues, 'password'> }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }: { field: ControllerRenderProps<ResetPasswordFormValues, 'confirmPassword'> }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
        <div className="mt-4 text-center text-sm">
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Cancel and return to sign in
          </Link>
        </div>
      </form>
    </Form>
  );
} 