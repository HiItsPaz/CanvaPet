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
import { CheckCircle, Mail, AlertCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Icon } from '@/components/ui/icon';
import { AuthTransition, AuthFormTransition } from './AuthTransition';
import { FormInputValidation, useValidationState, ValidationMessage } from '@/components/ui/form-validation-icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type FormData = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // For real-time validation
  const [email, setEmail] = useState('');
  
  // Email validation
  const emailValidation = useValidationState(
    email,
    {
      valid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      invalid: (value) => value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    },
    {
      valid: 'Valid email address',
      invalid: 'Please enter a valid email address',
    }
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: FormData) {
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
      setEmail('');
    }
  }

  return (
    <AuthFormTransition>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AuthTransition show={!!error} type="slideUp">
            <Alert variant="destructive" className="mb-6">
              <Icon icon={AlertCircle} size="sm" className="mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </AuthTransition>

          <AuthTransition show={success} type="scale">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900 mb-6">
              <Icon icon={CheckCircle} size="sm" className="text-green-600 dark:text-green-400 mr-2" />
              <AlertTitle className="text-green-800 dark:text-green-300">Password Reset Email Sent</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                <div className="mt-4">
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                    <Icon icon={ArrowLeft} size="xs" />
                    <span>Return to sign in</span>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          </AuthTransition>

          {!success && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Icon icon={Mail} size="sm" />
                        </span>
                        <FormInputValidation state={emailValidation.state} message={emailValidation.message}>
                          <Input 
                            className="pl-10 pr-10" 
                            placeholder="you@example.com" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setEmail(e.target.value);
                            }}
                          />
                        </FormInputValidation>
                        <ValidationMessage 
                          state={emailValidation.state}
                          message={emailValidation.message}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Icon icon={Loader2} size="sm" className="animate-spin mr-2" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Icon icon={ArrowRight} size="sm" className="ml-2" />
                  </>
                )}
              </Button>
              
              <div className="mt-4 text-center">
                <Link 
                  href="/auth/signin" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1"
                >
                  <Icon icon={ArrowLeft} size="xs" />
                  <span>Back to sign in</span>
                </Link>
              </div>
            </>
          )}
        </form>
      </Form>
    </AuthFormTransition>
  );
} 