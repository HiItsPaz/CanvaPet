'use client';

import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mail, Lock, AlertCircle, CheckCircle, UserPlus, Loader2 } from "lucide-react"
import { Icon } from '@/components/ui/icon';
import { 
  FormInputValidation, 
  ValidationState,
  useValidationState,
  ValidationMessage
} from '@/components/ui/form-validation-icons';
import Link from 'next/link';
import { SocialLogin } from './SocialLogin';
import { AuthTransition, AuthFormTransition } from './AuthTransition';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], 
});

type SignUpFormValues = z.infer<typeof formSchema>;

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // For real-time validation as user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email validation
  const emailValidation = useValidationState(
    email,
    {
      valid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      invalid: (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    },
    {
      valid: 'Valid email format',
      invalid: 'Invalid email format',
    }
  );

  // Password validation
  const passwordValidation = useValidationState(
    password,
    {
      valid: (value) => value.length >= 8,
      invalid: (value) => value.length > 0 && value.length < 8,
      warning: (value) => value.length >= 8 && !/[A-Z]/.test(value),
    },
    {
      valid: 'Password meets requirements',
      invalid: 'Password must be at least 8 characters',
      warning: 'Consider adding uppercase letters for stronger password',
    }
  );

  // Confirm password validation
  const confirmPasswordValidation = useValidationState(
    confirmPassword,
    {
      valid: (value) => value === password && value.length > 0,
      invalid: (value) => value !== password && value.length > 0,
    },
    {
      valid: 'Passwords match',
      invalid: 'Passwords do not match',
    }
  );

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`, 
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("User with this email already exists. If you haven't confirmed your email, please check your inbox.");
    } else if (data.user) {
      setSuccess(true);
      form.reset();
      // Reset the states
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      // Fallback error if no user data and no specific signUpError
      setError('An unexpected error occurred. Please try again.');
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
              <AlertTitle className="text-green-800 dark:text-green-300">Account Created</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Please check your email for a confirmation link.
              </AlertDescription>
            </Alert>
          </AuthTransition>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: ControllerRenderProps<SignUpFormValues, 'email'> }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Icon icon={Mail} size="sm" />
                      <span>Email</span>
                    </div>
                  </FormLabel>
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
                    </div>
                  </FormControl>
                  <ValidationMessage 
                    state={emailValidation.state}
                    message={emailValidation.message}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: ControllerRenderProps<SignUpFormValues, 'password'> }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Icon icon={Lock} size="sm" />
                      <span>Password</span>
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
              render={({ field }: { field: ControllerRenderProps<SignUpFormValues, 'confirmPassword'> }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Icon icon={Lock} size="sm" />
                      <span>Confirm Password</span>
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
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || 
              email === '' || 
              password === '' || 
              confirmPassword === '' || 
              passwordValidation.state === 'invalid' || 
              emailValidation.state === 'invalid' || 
              confirmPasswordValidation.state === 'invalid'
          }>
            {loading ? (
              <>
                <Icon icon={Loader2} size="sm" className="mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Icon icon={UserPlus} size="sm" className="mr-2" />
                Sign Up
              </>
            )}
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Sign In
              </Link>
            </p>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <SocialLogin />
        </form>
      </Form>
    </AuthFormTransition>
  );
} 