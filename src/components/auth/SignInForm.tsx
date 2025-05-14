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
import { Mail, Lock, AlertCircle, LogIn, Loader2 } from "lucide-react";
import { Icon } from '@/components/ui/icon';
import { 
  FormInputValidation, 
  ValidationState,
  useValidationState,
  ValidationMessage
} from '@/components/ui/form-validation-icons';
import { SocialLogin } from './SocialLogin';
import { AuthTransition, AuthFormTransition } from './AuthTransition';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Min 1 to ensure it's not empty
});

type SignInFormValues = z.infer<typeof formSchema>;

export function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For real-time validation as user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  // Password validation - just check if it's not empty
  const passwordValidation = useValidationState(
    password,
    {
      valid: (value) => value.length > 0,
      invalid: (value) => value.length === 0,
    },
    {
      valid: 'Password provided',
      invalid: 'Password is required',
    }
  );

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
      router.push('/dashboard'); 
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

          <div className="space-y-4">
            {/* Email Field */}
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
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ValidationMessage 
              state={emailValidation.state}
              message={emailValidation.message}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Icon icon={Lock} size="sm" />
                      </span>
                      <FormInputValidation state={passwordValidation.state} message={passwordValidation.message}>
                        <Input 
                          className="pl-10 pr-10" 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            setPassword(e.target.value);
                          }}
                        />
                      </FormInputValidation>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ValidationMessage 
              state={passwordValidation.state}
              message={passwordValidation.message}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon icon={Loader2} size="sm" className="mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Icon icon={LogIn} size="sm" className="mr-2" />
                Sign In
              </>
            )}
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Sign Up
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