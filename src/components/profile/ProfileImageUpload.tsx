'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Terminal, Upload, User, X } from 'lucide-react';
import { uploadProfileImage } from '@/lib/profile';
import { useAuth } from '@/contexts/AuthContext';
import { Profile, AvatarFile } from '@/types/profile';

type ProfileImageUploadProps = {
  profile: Profile | null;
};

export function ProfileImageUpload({ profile }: ProfileImageUploadProps) {
  const [avatarFile, setAvatarFile] = useState<AvatarFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshProfile } = useAuth();

  // Format the user's initial for the avatar fallback
  const getInitials = () => {
    if (!profile?.display_name) return '?';
    return profile.display_name.charAt(0).toUpperCase();
  };

  // Process file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarFile({
        file,
        preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    
    setError(null);
    setSuccess(false);
  };

  // Clear selected file
  const handleClearFile = () => {
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload the image
  const handleUpload = async () => {
    if (!avatarFile) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const result = await uploadProfileImage(avatarFile.file);
    
    setLoading(false);
    
    if (!result) {
      setError('Failed to upload image');
    } else {
      setSuccess(true);
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh the profile data in the auth context to get the new avatar URL
      await refreshProfile();
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-300">
            Profile Picture Updated
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Your profile picture has been updated successfully.
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

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar className="h-32 w-32">
              {avatarFile ? (
                <AvatarImage src={avatarFile.preview} alt="Profile preview" />
              ) : (
                <>
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                    {getInitials()}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            {avatarFile && (
              <button
                onClick={handleClearFile}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
                aria-label="Clear image"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            Current Profile Picture
          </span>
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="profile-image">Upload a new profile picture</Label>
            <input
              ref={fileInputRef}
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
              {avatarFile && (
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Uploading...' : 'Upload Image'}
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Accepted formats: JPG, PNG, GIF. Maximum file size: 2MB.
          </p>
        </div>
      </div>
    </div>
  );
} 