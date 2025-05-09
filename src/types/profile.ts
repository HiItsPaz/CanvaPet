import { Database } from '@/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ProfileFormData {
  display_name: string;
  bio?: string | null;
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileWithAvatar extends Profile {
  avatar_url: string | null;
}

// Helper types for avatar uploads
export interface UploadAvatarResponse {
  path: string;
  url: string;
}

export interface AvatarFile {
  file: File;
  preview: string;
} 