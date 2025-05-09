import { NextResponse } from 'next/server';
import { createRouteHandlerClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { initializeStorage, BUCKET_NAMES } from '@/lib/storageUtils';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const runtime = 'nodejs';

/**
 * API endpoint to initialize storage buckets and security policies
 * Call this endpoint once during app initialization or after deployment
 * 
 * This endpoint requires authentication as an admin to run
 */
export async function GET() {
  try {
    // Create server supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated (optionally, check if admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Initialize storage buckets
    const result = await initializeStorage();
    
    // Configure security policies for pet-photos bucket
    // This makes sure users can only access their own photos
    await configurePetPhotosBucketPolicy(supabase);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true,
        buckets: [BUCKET_NAMES.PET_PHOTOS, BUCKET_NAMES.USER_AVATARS],
        ...result 
      }, 
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Storage initialization error:', error);
    
    // Return error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to initialize storage' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to initialize storage' }, 
      { status: 500 }
    );
  }
}

/**
 * Configure storage security policies for the pet photos bucket
 */
async function configurePetPhotosBucketPolicy(supabase: SupabaseClient<Database>) {
  try {
    // Create policy for allowing uploads to your own folder based on user ID
    await supabase.rpc('create_storage_policy', {
      bucket_name: BUCKET_NAMES.PET_PHOTOS,
      policy_name: 'upload_own_photos',
      definition: `((bucket_id = '${BUCKET_NAMES.PET_PHOTOS}'::text) AND (auth.uid()::text = SPLIT_PART(name::text, '/'::text, 1)))`,
      operation: 'INSERT',
      check_is_owner: false,
    });
    
    // Create policy for reading only your own photos
    await supabase.rpc('create_storage_policy', {
      bucket_name: BUCKET_NAMES.PET_PHOTOS,
      policy_name: 'read_own_photos',
      definition: `((bucket_id = '${BUCKET_NAMES.PET_PHOTOS}'::text) AND (auth.uid()::text = SPLIT_PART(name::text, '/'::text, 1)))`,
      operation: 'SELECT',
      check_is_owner: false,
    });
    
    // Create policy for updating only your own photos
    await supabase.rpc('create_storage_policy', {
      bucket_name: BUCKET_NAMES.PET_PHOTOS,
      policy_name: 'update_own_photos',
      definition: `((bucket_id = '${BUCKET_NAMES.PET_PHOTOS}'::text) AND (auth.uid()::text = SPLIT_PART(name::text, '/'::text, 1)))`,
      operation: 'UPDATE',
      check_is_owner: false,
    });
    
    // Create policy for deleting only your own photos
    await supabase.rpc('create_storage_policy', {
      bucket_name: BUCKET_NAMES.PET_PHOTOS,
      policy_name: 'delete_own_photos',
      definition: `((bucket_id = '${BUCKET_NAMES.PET_PHOTOS}'::text) AND (auth.uid()::text = SPLIT_PART(name::text, '/'::text, 1)))`,
      operation: 'DELETE',
      check_is_owner: false,
    });
    
    return { message: 'Security policies created successfully' };
  } catch (error) {
    console.error('Error creating storage policies:', error);
    throw error;
  }
} 