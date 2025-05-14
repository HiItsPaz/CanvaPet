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
import { CheckCircle, User, AlertCircle, Loader2, ScrollText, Save } from "lucide-react";
import { updateProfile } from '@/lib/profile';
import { Profile, ProfileFormData } from '@/types/profile';
import { Icon } from '@/components/ui/icon';
import { 
  FormInputValidation, 
  ValidationState,
  useValidationState
} from '@/components/ui/form-validation-icons';

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
  
  // For real-time validation as user types
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  // Display name validation
  const displayNameValidation = useValidationState(
    displayName,
    {
      valid: (value) => value.length > 0 && value.length <= 50,
      invalid: (value) => value.length === 0 || value.length > 50,
    },
    {
      valid: 'Valid display name',
      invalid: 'Display name must be between 1 and 50 characters',
    }
  );

  // Bio validation
  const bioValidation = useValidationState(
    bio || '',
    {
      valid: (value) => value.length <= 300,
      invalid: (value) => value.length > 300,
      warning: (value) => value.length > 250 && value.length <= 300,
    },
    {
      valid: 'Bio length is acceptable',
      invalid: 'Bio exceeds 300 characters',
      warning: 'Approaching maximum bio length',
    }
  );

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
            <Icon icon={CheckCircle} size="sm" className="text-green-600 dark:text-green-400 mr-2" />
            <AlertTitle className="text-green-800 dark:text-green-300">Profile Updated</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your profile information has been updated successfully.
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
          name="display_name"
          render={({ field }: { field: ControllerRenderProps<ProfileFormData, 'display_name'> }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Icon icon={User} size="sm" />
                  <span>Display Name</span>
                </div>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Icon icon={User} size="sm" />
                  </span>
                  <FormInputValidation state={displayNameValidation.state} message={displayNameValidation.message}>
                    <Input 
                      className="pl-10 pr-10" 
                      placeholder="Your name" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setDisplayName(e.target.value);
                      }}
                    />
                  </FormInputValidation>
                </div>
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
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Icon icon={ScrollText} size="sm" />
                  <span>Bio</span>
                </div>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <FormInputValidation state={bioValidation.state} message={bioValidation.message}>
                    <Textarea 
                      placeholder="Tell us a bit about yourself"
                      {...field}
                      value={field.value || ''}
                      className="resize-none h-24"
                      onChange={(e) => {
                        field.onChange(e);
                        setBio(e.target.value);
                      }}
                    />
                  </FormInputValidation>
                </div>
              </FormControl>
              <FormDescription>
                A brief description about yourself (max 300 characters).
                {bio && (
                  <span className={bioValidation.state === 'warning' || bioValidation.state === 'invalid' ? 'text-warning' : ''}>
                    {` ${bio.length}/300 characters`}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={loading || displayNameValidation.state === 'invalid' || bioValidation.state === 'invalid'}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Icon icon={Loader2} size="sm" className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Icon icon={Save} size="sm" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
} 