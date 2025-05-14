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
import { CheckCircle, Lock, AlertCircle, Loader2, ArrowRight, ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { Icon } from '@/components/ui/icon';
import { AuthTransition, AuthFormTransition } from './AuthTransition';
import { FormInputValidation, useValidationState, ValidationMessage } from '@/components/ui/form-validation-icons';

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
  
  // For real-time validation
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password validation
  const passwordValidation = useValidationState(
    password,
    {
      valid: (value) => value.length >= 8,
      warning: (value) => value.length >= 8 && value.length < 12,
      invalid: (value) => value.length > 0 && value.length < 8,
    },
    {
      valid: 'Password meets requirements',
      warning: 'Password is acceptable but could be stronger',
      invalid: 'Password must be at least 8 characters',
    }
  );

  // Confirm password validation
  const confirmPasswordValidation = useValidationState(
    confirmPassword,
    {
      valid: (value) => value.length > 0 && value === password,
      invalid: (value) => value.length > 0 && value !== password,
    },
    {
      valid: 'Passwords match',
      invalid: 'Passwords do not match',
    }
  );

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
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to sign in page after a delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 5000);
    }
  }

  if (validToken === false) {
    return (
      <Alert variant="destructive">
        <Icon icon={AlertCircle} size="sm" className="mr-2" />
        <AlertTitle>Invalid Reset Link</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-4">
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline flex items-center gap-1">
              <Icon icon={RefreshCw} size="xs" />
              <span>Request a new password reset link</span>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
        <Icon icon={CheckCircle} size="sm" className="text-green-600 dark:text-green-400 mr-2" />
        <AlertTitle className="text-green-800 dark:text-green-300">Password Updated Successfully</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          Your password has been changed successfully. You will be redirected to the sign-in page in 5 seconds.
          <div className="mt-4">
            <Link href="/auth/signin" className="text-primary font-medium hover:underline flex items-center gap-1">
              <Icon icon={ArrowRight} size="xs" />
              <span>Sign in now</span>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (validToken === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon icon={Loader2} size="lg" className="animate-spin mr-2" />
        <span>Verifying your reset link...</span>
      </div>
    );
  }

  return (
    <AuthFormTransition>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AuthTransition show={!!error} type="slideUp">
            <Alert variant="destructive">
              <Icon icon={AlertCircle} size="sm" className="mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </AuthTransition>
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: ControllerRenderProps<ResetPasswordFormValues, 'password'> }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <Icon icon={Lock} size="sm" />
                    <span>New Password</span>
                  </div>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icon icon={Lock} size="sm" />
                    </span>
                    <FormInputValidation state={passwordValidation.state} message={passwordValidation.message}>
                      <Input 
                        className="pl-10 pr-10" 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                        autoComplete="new-password" 
                        onChange={(e) => {
                          field.onChange(e);
                          setPassword(e.target.value);
                        }}
                      />
                    </FormInputValidation>
                  </div>
                </FormControl>
                <ValidationMessage 
                  state={passwordValidation.state} 
                  message={passwordValidation.message} 
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }: { field: ControllerRenderProps<ResetPasswordFormValues, 'confirmPassword'> }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <Icon icon={Lock} size="sm" />
                    <span>Confirm New Password</span>
                  </div>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icon icon={Lock} size="sm" />
                    </span>
                    <FormInputValidation state={confirmPasswordValidation.state} message={confirmPasswordValidation.message}>
                      <Input 
                        className="pl-10 pr-10" 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                        autoComplete="new-password"
                        onChange={(e) => {
                          field.onChange(e);
                          setConfirmPassword(e.target.value);
                        }}
                      />
                    </FormInputValidation>
                  </div>
                </FormControl>
                <ValidationMessage 
                  state={confirmPasswordValidation.state} 
                  message={confirmPasswordValidation.message} 
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={loading || passwordValidation.state === "invalid" || confirmPasswordValidation.state === "invalid"} 
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon={Loader2} size="sm" className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Icon icon={ShieldCheck} size="sm" />
                <span>Update Password</span>
              </>
            )}
          </Button>
          
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/signin" className="font-medium text-primary hover:underline flex items-center justify-center gap-1">
              <Icon icon={ArrowLeft} size="xs" />
              <span>Cancel and return to sign in</span>
            </Link>
          </div>
        </form>
      </Form>
    </AuthFormTransition>
  );
} 