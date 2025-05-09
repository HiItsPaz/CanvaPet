import { supabase } from '@/lib/supabase';
import { Profile, ProfileFormData, PasswordChangeFormData, UploadAvatarResponse } from '@/types/profile';

/**
 * Fetch the profile for the current user or a specific user ID
 */
export async function getProfile(userId?: string): Promise<Profile | null> {
  const { data: user } = await supabase.auth.getUser();
  const id = userId || user.user?.id;
  
  if (!id) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  
  return data;
}

/**
 * Update a user's profile information
 */
export async function updateProfile(profileData: ProfileFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Sanitize inputs
    const sanitizedData = {
      display_name: profileData.display_name.trim(),
      bio: profileData.bio?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from('profiles')
      .update(sanitizedData)
      .eq('id', user.user.id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    };
  }
}

/**
 * Upload a profile image to Supabase Storage
 */
export async function uploadProfileImage(file: File): Promise<UploadAvatarResponse | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user?.id) {
      throw new Error('Not authenticated');
    }
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      throw new Error('Image size must be less than 2MB');
    }
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.user.id}/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);
    
    if (!urlData.publicUrl) throw new Error('Failed to get public URL');
    
    // Update the user's profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.user.id);
    
    if (updateError) throw updateError;
    
    return {
      path: filePath,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return null;
  }
}

/**
 * Change the user's password
 */
export async function changePassword(
  passwordData: PasswordChangeFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, verify the current password by attempting to sign in
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user?.email) {
      return { success: false, error: 'User email not found' };
    }
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.user.email,
      password: passwordData.current_password,
    });
    
    if (signInError) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // If we get here, the current password is valid
    // Update to the new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordData.new_password,
    });
    
    if (updateError) throw updateError;
    
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to change password' 
    };
  }
} 