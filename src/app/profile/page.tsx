'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { NotificationPreferences } from '@/components/profile/NotificationPreferences';
import { AccountDeletion } from '@/components/profile/AccountDeletion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';
import { User, Camera, Lock, Bell, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Icon icon={User} size="md" />
        <span>Profile Settings</span>
      </h1>
      
      <Tabs defaultValue="profile" className="mb-10">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <Icon icon={User} size="sm" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-1">
            <Icon icon={Camera} size="sm" />
            <span>Avatar</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-1">
            <Icon icon={Lock} size="sm" />
            <span>Password</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Icon icon={Bell} size="sm" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1">
            <Icon icon={ShieldAlert} size="sm" />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon={User} size="sm" />
                <span>Profile Information</span>
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <Icon icon={Camera} size="sm" />
                <span>Profile Picture</span>
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <Icon icon={Lock} size="sm" />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon={Bell} size="sm" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Manage your notification preferences and email subscriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferences />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon={ShieldAlert} size="sm" className="text-destructive" />
                <span>Account Management</span>
              </CardTitle>
              <CardDescription>
                Manage your account settings and delete your account if needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* We could add more account settings here in the future */}
                <Separator className="my-4" />
                <AccountDeletion />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 