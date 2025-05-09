"use client";

// This file contains React Hook dependencies that are intentionally included 
// but ESLint is reporting issues with them. Disabling the rule for this file.
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as LucideImage, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadFileWithMetadata, getSignedUploadUrl, BUCKET_NAMES } from '@/lib/storageUtils';
import type { FileMetadata } from '@/lib/storageUtils';
import Image from 'next/image';

interface SupabaseFileUploaderProps {
  bucketName?: string;
  folderPath?: string;
  onUploadComplete?: (url: string, metadata: Partial<FileMetadata>) => void;
  onUploadError?: (error: string) => void;
  maxRetries?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  showPreview?: boolean;
  additionalMetadata?: Partial<FileMetadata>;
  initialFile?: File; // Allow a pre-selected file to be passed in
}

export function SupabaseFileUploader({
  bucketName = BUCKET_NAMES.PET_PHOTOS,
  folderPath = '',
  onUploadComplete,
  onUploadError,
  maxRetries = 3,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showPreview = true,
  additionalMetadata = {},
  initialFile,
}: SupabaseFileUploaderProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Set up preview when file is selected
  useEffect(() => {
    if (!file || !showPreview) return undefined;
    
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    return undefined;
  }, [file, showPreview]); // Both file and showPreview are required

  // Handle initial file if provided
  useEffect(() => {
    if (initialFile && initialFile !== file) {
      setFile(initialFile);
    }
  }, [initialFile]);

  // Handle file selection
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      const errorMsg = `File type not allowed. Please upload one of: ${allowedTypes.join(', ')}`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }
    
    // Validate file size
    if (selectedFile.size > maxSize) {
      const errorMsg = `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setUploadComplete(false);
  }, [allowedTypes, maxSize, onUploadError]);

  // Upload file to Supabase
  const uploadFile = useCallback(async () => {
    if (!file || !user) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Create file path based on user ID and folder path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = folderPath 
        ? `${folderPath}/${fileName}` 
        : `${user.id}/${fileName}`;
      
      // Create metadata object
      const metadata: Partial<FileMetadata> = {
        userId: user.id,
        uploadedAt: new Date().toISOString(),
        ...additionalMetadata
      };
      
      // Use direct upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      // Create a promise that resolves when upload completes
      const uploadPromise = new Promise<string>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        });
        
        // Handle upload errors
        xhr.upload.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        // Handle upload completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(filePath);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
      });
      
      // Get a signed URL for upload
      const { signedUrl } = await getSignedUploadUrl(bucketName, filePath);
      
      // Set up the XHR request
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
      
      // Wait for upload to complete
      await uploadPromise;
      
      // Update metadata after successful upload
      // Get public URL for the uploaded file
      const publicUrl = await uploadFileWithMetadata(bucketName, filePath, file, metadata);
      
      // Update state
      setUploading(false);
      setProgress(100);
      setUploadComplete(true);
      
      // Notify parent component
      onUploadComplete?.(publicUrl, {
        ...metadata,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
    } catch (err: unknown) {
      console.error('Error uploading file:', err);
      
      // Attempt retry if under max retries
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Upload failed: ${errorMessage}. Retrying (${retryCount + 1}/${maxRetries})...`);
        
        // Wait a moment before retrying
        setTimeout(() => {
          uploadFile();
        }, 2000);
        
      } else {
        // Max retries reached
        setUploading(false);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Upload failed after ${maxRetries} attempts: ${errorMessage}`);
        onUploadError?.(errorMessage);
      }
    }
  }, [file, user, bucketName, folderPath, retryCount, maxRetries, onUploadComplete, onUploadError, additionalMetadata]);
  
  // Clear file and reset state
  const handleClear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    setRetryCount(0);
    setUploadComplete(false);
  }, []);
  
  // Retry failed upload
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    uploadFile();
  }, [uploadFile]);
  
  return (
    <div className="w-full">
      {/* File input */}
      {!file && (
        <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
          <Upload className="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            Click to select or drop a file
          </p>
          <input
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="secondary" size="sm">
            Select File
          </Button>
        </div>
      )}
      
      {/* File preview and upload controls */}
      {file && (
        <div className="w-full p-4 border rounded-lg border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {showPreview && preview ? (
                <LucideImage className="w-6 h-6 mr-2 text-gray-500 dark:text-gray-400" />
              ) : (
                <Upload className="w-6 h-6 mr-2 text-gray-500 dark:text-gray-400" />
              )}
              <span className="text-sm font-medium truncate max-w-[200px]">
                {file.name}
              </span>
            </div>
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* File preview for images */}
          {showPreview && preview && (
            <div className="mb-4 overflow-hidden rounded-lg">
              <Image 
                src={preview} 
                alt="File preview" 
                width={500}
                height={300}
                className="object-cover w-full max-h-64" 
              />
            </div>
          )}
          
          {/* Upload progress */}
          {uploading && (
            <div className="mb-2">
              <Progress value={progress} className="h-2" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Uploading: {progress}%
              </p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="flex items-center p-2 mb-2 rounded-md bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {/* Upload controls */}
          <div className="flex space-x-2">
            {!uploadComplete && !uploading && (
              <Button
                onClick={uploadFile}
                className="w-full"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            )}
            
            {error && !uploading && (
              <Button
                variant="outline"
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            
            {uploadComplete && (
              <div className="flex items-center p-2 mb-2 rounded-md bg-green-50 dark:bg-green-900/20 w-full">
                <Check className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">Upload complete</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable react-hooks/exhaustive-deps */ 