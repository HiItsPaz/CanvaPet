import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';
import { BUCKET_NAMES } from './storageUtils';

/**
 * Initialize storage buckets and policies
 * This should be called during app initialization or via a migration
 */
export async function initializeStorage() {
  // This function must be called server-side only
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Create pet photos bucket if it doesn't exist
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAMES.PET_PHOTOS);
  
  if (!bucketData && !bucketError) {
    // Create pet photos bucket
    const { error } = await supabase.storage.createBucket(BUCKET_NAMES.PET_PHOTOS, {
      public: false, // Private by default
      fileSizeLimit: 10485760, // 10MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], 
    });
    
    if (error) {
      console.error('Error creating pet photos bucket:', error);
      throw error;
    }
    
    console.log(`Created ${BUCKET_NAMES.PET_PHOTOS} bucket`);
  }
  
  // Create avatars bucket if it doesn't exist
  const { data: avatarBucketData, error: avatarBucketError } = await supabase.storage.getBucket(BUCKET_NAMES.USER_AVATARS);
  
  if (!avatarBucketData && !avatarBucketError) {
    // Create avatars bucket
    const { error } = await supabase.storage.createBucket(BUCKET_NAMES.USER_AVATARS, {
      public: true, // Public for avatar access
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
    
    if (error) {
      console.error('Error creating avatars bucket:', error);
      throw error;
    }
    
    console.log(`Created ${BUCKET_NAMES.USER_AVATARS} bucket`);
  }
  
  return { message: 'Storage buckets initialized successfully' };
}

/**
 * Get a server-side Supabase client that can be used in server components and API routes
 */
export function getServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies });
} 