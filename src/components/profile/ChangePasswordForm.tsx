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
import { CheckCircle2, Terminal } from "lucide-react";
import { changePassword } from '@/lib/profile';
import { PasswordChangeFormData } from '@/types/profile';

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
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Password Updated</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your password has been changed successfully.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="current_password"
          render={({ field }: { field: ControllerRenderProps<PasswordChangeFormData, 'current_password'> }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} autoComplete="current-password" />
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
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
              </FormControl>
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
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Change Password'}
        </Button>
      </form>
    </Form>
  );
} 