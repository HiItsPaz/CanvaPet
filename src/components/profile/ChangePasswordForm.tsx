'use client';

import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { changePassword } from '@/lib/profile';
import { PasswordChangeFormData } from '@/types/profile';
import { Icon } from '@/components/ui/icon';
import { 
  FormInputValidation, 
  ValidationState,
  useValidationState,
  ValidationMessage
} from '@/components/ui/form-validation-icons';

// Form validation schema
const passwordFormSchema = z.object({
  current_password: z.string().min(1, { message: 'Current password is required' }),
  new_password: z.string().min(8, { message: 'New password must be at least 8 characters' }),
  confirm_password: z.string().min(1, { message: 'Please confirm your new password' }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For real-time validation
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Current password validation
  const currentPasswordValidation = useValidationState(
    currentPassword,
    {
      valid: (value) => value.length > 0,
      invalid: (value) => value.length === 0,
    },
    {
      valid: 'Current password provided',
      invalid: 'Current password is required',
    }
  );

  // New password validation
  const newPasswordValidation = useValidationState(
    newPassword,
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
      valid: (value) => value === newPassword && value.length > 0,
      invalid: (value) => value !== newPassword && value.length > 0,
    },
    {
      valid: 'Passwords match',
      invalid: 'Passwords do not match',
    }
  );

  // Set up form
  const form = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  async function onSubmit(data: PasswordChangeFormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await changePassword(data);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to change password');
    } else {
      setSuccess(true);
      form.reset();
      
      // Reset validation states
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
            <Icon icon={CheckCircle} size="sm" className="text-green-600 dark:text-green-400 mr-2" />
            <AlertTitle className="text-green-800 dark:text-green-300">Password Updated</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your password has been changed successfully.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <Icon icon={AlertCircle} size="sm" className="mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="current_password"
          render={({ field }: { field: ControllerRenderProps<PasswordChangeFormData, 'current_password'> }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Icon icon={Lock} size="sm" />
                  <span>Current Password</span>
                </div>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Icon icon={Lock} size="sm" />
                  </span>
                  <FormInputValidation state={currentPasswordValidation.state} message={currentPasswordValidation.message}>
                    <Input 
                      className="pl-10 pr-10" 
                      type="password" 
                      placeholder="********" 
                      {...field} 
                      autoComplete="current-password"
                      onChange={(e) => {
                        field.onChange(e);
                        setCurrentPassword(e.target.value);
                      }}
                    />
                  </FormInputValidation>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="new_password"
          render={({ field }: { field: ControllerRenderProps<PasswordChangeFormData, 'new_password'> }) => (
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
                  <FormInputValidation state={newPasswordValidation.state} message={newPasswordValidation.message}>
                    <Input 
                      className="pl-10 pr-10" 
                      type="password" 
                      placeholder="********" 
                      {...field} 
                      autoComplete="new-password"
                      onChange={(e) => {
                        field.onChange(e);
                        setNewPassword(e.target.value);
                      }}
                    />
                  </FormInputValidation>
                </div>
              </FormControl>
              <ValidationMessage 
                state={newPasswordValidation.state}
                message={newPasswordValidation.message}
              />
              <FormDescription>
                Password must be at least 8 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }: { field: ControllerRenderProps<PasswordChangeFormData, 'confirm_password'> }) => (
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
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={loading || 
            currentPasswordValidation.state === 'invalid' || 
            newPasswordValidation.state === 'invalid' || 
            confirmPasswordValidation.state === 'invalid'
          }
          className="flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Icon icon={Loader2} size="sm" className="animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Icon icon={ShieldCheck} size="sm" />
              <span>Change Password</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
} 