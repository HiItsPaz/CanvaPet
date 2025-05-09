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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Terminal } from "lucide-react";
import { updateProfile } from '@/lib/profile';
import { Profile, ProfileFormData } from '@/types/profile';

// Form validation schema
const profileFormSchema = z.object({
  display_name: z.string().min(1, { message: 'Display name is required' }).max(50),
  bio: z.string().max(300, { message: 'Bio cannot exceed 300 characters' }).nullable().optional(),
});

type ProfileFormProps = {
  profile: Profile | null;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up form with initial values from the profile
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile(data);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to update profile');
    } else {
      setSuccess(true);
      // Refresh the profile data in the auth context
      await refreshProfile();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Profile Updated</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your profile information has been updated successfully.
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
          name="display_name"
          render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'display_name'> }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'bio'> }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us a bit about yourself"
                  {...field}
                  value={field.value || ''}
                  className="resize-none h-24"
                />
              </FormControl>
              <FormDescription>
                A brief description about yourself (max 300 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
} 