"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

// Bucket name constants
export const BUCKET_NAMES = {
  PET_PHOTOS: 'pet-photos',
  USER_AVATARS: 'avatars',
};

// Storage file metadata types
export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  userId: string;
  petId?: string;
  width?: number;
  height?: number;
  petDetection?: {
    isPet: boolean;
    confidence: number;
    animalType?: string;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  tags?: string[];
  validationWarnings?: string[];
  dimensions?: { 
    width: number; 
    height: number; 
  };
  quality?: { 
    tooDark?: boolean;
    tooBlurry?: boolean;
    lowResolution?: boolean;
    score?: number; // Overall quality score 0-100
  };
  validationStatus?: 'passed' | 'warning' | 'failed';
  processingHistory?: {
    cropped?: boolean;
    enhanced?: boolean;
    timestamp: string;
  }[];
}

/**
 * Upload a file to Supabase storage with metadata
 * @param bucketName Bucket name to upload to
 * @param filePath Path within the bucket (typically userId/filename.ext)
 * @param file File to upload
 * @param metadata Metadata to store with the file
 * @returns Public URL of the uploaded file
 */
export async function uploadFileWithMetadata(
  bucketName: string,
  filePath: string,
  file: File,
  metadata: Partial<FileMetadata>
): Promise<string> {
  const supabase = createClientComponentClient<Database>();
  
  // Create the full metadata object
  const fullMetadata: FileMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadedAt: new Date().toISOString(),
    userId: metadata.userId || '',
    ...metadata,
  };
  
  // Convert all metadata values to strings for Supabase
  const stringifiedMetadata: Record<string, string> = {};
  for (const key in fullMetadata) {
    if (Object.prototype.hasOwnProperty.call(fullMetadata, key)) {
      const typedKey = key as keyof FileMetadata;
      const value = fullMetadata[typedKey];
      if (value !== undefined && value !== null) {
        stringifiedMetadata[typedKey] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }
  }

  // Upload file with metadata
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600', // 1 hour cache
      upsert: true, // Overwrite if exists
      contentType: file.type,
      metadata: stringifiedMetadata, // Use stringified metadata
    });
  
  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
  
  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return publicUrlData.publicUrl;
}

/**
 * Generate a pre-signed URL for uploading a file directly to storage
 * @param bucketName Bucket name
 * @param filePath Path within the bucket
 * @returns Signed URL for direct upload
 */
export async function getSignedUploadUrl(bucketName: string, filePath: string): Promise<{
  signedUrl: string;
  path: string;
  token: string;
}> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(filePath);
  
  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
  
  return data;
}

/**
 * Download a file from storage
 * @param bucketName Bucket name
 * @param filePath Path within the bucket
 * @returns File data
 */
export async function downloadFile(bucketName: string, filePath: string): Promise<Blob> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);
  
  if (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get metadata for a file
 * @param bucketName Bucket name
 * @param filePath Path within the bucket
 * @returns File metadata
 */
export async function getFileMetadata(bucketName: string, filePath: string): Promise<FileMetadata> {
  const supabase = createClientComponentClient<Database>();
  
  // First we need to get the file details which contains metadata
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list('', {
      limit: 1,
      offset: 0,
      search: filePath
    });
  
  if (error || !data || data.length === 0) {
    console.error('Error getting file details:', error || 'File not found');
    throw error || new Error('File not found');
  }
  
  // Get the file metadata from the first matching result
  const fileDetails = data[0];
  return (fileDetails.metadata || {}) as unknown as FileMetadata;
}

/**
 * List files in a folder with pagination
 * @param bucketName Bucket name
 * @param folderPath Folder path within the bucket
 * @param options Options for listing (limit, offset, etc.)
 * @returns List of files with metadata
 */
export async function listFiles(
  bucketName: string,
  folderPath: string,
  options?: { limit?: number; offset?: number; sortBy?: { column: string; order: 'asc' | 'desc' } }
) {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderPath, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy
    });
  
  if (error) {
    console.error('Error listing files:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update metadata for a file
 * @param bucketName Bucket name
 * @param filePath Path within the bucket
 * @param metadata Metadata to update
 */
export async function updateFileMetadata(
  bucketName: string,
  filePath: string,
  metadata: Partial<FileMetadata>
): Promise<void> {
  const supabase = createClientComponentClient<Database>();
  
  // Approach: Re-upload the file with updated metadata
  // First, download the file
  const fileData = await downloadFile(bucketName, filePath);
  
  // Convert fileData to File object
  const file = new File([fileData], filePath.split('/').pop() || 'file', {
    type: fileData.type,
  });
  
  // Get existing metadata
  const existingMetadata = await getFileMetadata(bucketName, filePath);
  
  // Merge existing and new metadata
  const updatedMetadata = {
    ...existingMetadata,
    ...metadata,
  };
  
  // Re-upload with updated metadata
  await uploadFileWithMetadata(bucketName, filePath, file, updatedMetadata);
}

/**
 * Delete file(s) from storage
 * @param bucketName Bucket name
 * @param filePath Path(s) within the bucket
 */
export async function deleteFiles(bucketName: string, filePath: string | string[]): Promise<void> {
  const supabase = createClientComponentClient<Database>();
  
  const paths = Array.isArray(filePath) ? filePath : [filePath];
  
  const { error } = await supabase.storage
    .from(bucketName)
    .remove(paths);
  
  if (error) {
    console.error('Error deleting files:', error);
    throw error;
  }
} 