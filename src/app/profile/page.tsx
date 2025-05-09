'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [loading, user, router]);

  // Show loading state if auth is still initializing or user not loaded yet
  if (loading || !user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <Tabs defaultValue="profile" className="mb-10">
        <TabsList className="grid grid-cols-3 w-full md:w-1/2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-1/3" />
                </div>
              ) : (
                <ProfileForm profile={profile} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-48 w-48 rounded-full" />
                  <Skeleton className="h-10 w-1/3" />
                </div>
              ) : (
                <ProfileImageUpload profile={profile} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 