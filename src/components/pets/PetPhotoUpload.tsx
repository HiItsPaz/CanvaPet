"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ACCEPTED_FILE_TYPES, 
  MAX_FILE_SIZE, 
  validateFile, 
  compressImage,
  extractMetadata
} from '@/lib/imageUtils';
import { checkIsPet } from '@/lib/petUtils';
import { SupabaseFileUploader } from './SupabaseFileUploader';
import { BUCKET_NAMES } from '@/lib/storageUtils';

interface PetPhotoUploadProps {
  onUploadComplete?: (url: string, metadata?: Record<string, any>) => void;
  onUploadError?: (error: string) => void;
  requirePetDetection?: boolean;
}

export function PetPhotoUpload({
  onUploadComplete,
  onUploadError,
  requirePetDetection = true,
}: PetPhotoUploadProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDetectingPet, setIsDetectingPet] = useState(false);
  const [petDetectionResult, setPetDetectionResult] = useState<any | null>(null);
  const [petDetectionError, setPetDetectionError] = useState<string | null>(null);
  const [isReadyForUpload, setIsReadyForUpload] = useState(false);

  // Handle file drop from dropzone
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) {
        const errorMsg = 'You must be logged in to upload photos';
        onUploadError?.(errorMsg);
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        const errorMessage = validation.error || 'Invalid file';
        onUploadError?.(errorMessage);
        return;
      }

      setFile(file);
      setPetDetectionResult(null);
      setPetDetectionError(null);
      
      // Perform pet detection if required
      if (requirePetDetection) {
        try {
          setIsDetectingPet(true);
          const result = await checkIsPet(file);
          setPetDetectionResult(result);
          
          // Determine if file is ready for upload based on pet detection
          setIsReadyForUpload(result.isPet);
          
          // Set error if no pet detected and detection is required
          if (!result.isPet) {
            setPetDetectionError("No pet detected in this image. Please upload a photo of your pet.");
          }
        } catch (err: any) {
          console.error('Pet detection error:', err);
          setPetDetectionError(`Pet detection failed: ${err.message}`);
          // Don't block upload if detection fails, allow proceeding
          setIsReadyForUpload(true);
        } finally {
          setIsDetectingPet(false);
        }
      } else {
        // No pet detection required, ready for upload
        setIsReadyForUpload(true);
      }
    },
    [user, onUploadError, requirePetDetection]
  );

  // Configure dropzone with properly typed accept parameter
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/heic': [],
      'image/heif': []
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  // Handle upload completion
  const handleUploadComplete = useCallback((url: string, metadata: Record<string, any>) => {
    // Add pet detection result to the metadata if available
    const completeMetadata = {
      ...metadata,
      petDetection: petDetectionResult || undefined
    };
    
    // Pass the URL and metadata to the parent component
    onUploadComplete?.(url, completeMetadata);
    
    // Reset state for next upload
    setFile(null);
    setPetDetectionResult(null);
    setPetDetectionError(null);
    setIsReadyForUpload(false);
  }, [onUploadComplete, petDetectionResult]);

  return (
    <div className="w-full space-y-4">
      {/* Dropzone Area */}
      {!file && (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive
                ? 'Drop the pet photo here...'
                : 'Drag & drop a pet photo, or click to select one'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported formats: JPG, PNG, WebP (Max 10MB)
            </p>
          </div>
        </div>
      )}

      {/* Pet Detection Status */}
      {isDetectingPet && (
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-center">
            Analyzing image for pets...
          </p>
        </div>
      )}

      {/* Pet Detection Error */}
      {petDetectionError && (
        <div className="flex items-center p-4 space-x-2 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <AlertCircle className="flex-shrink-0 w-5 h-5 text-amber-500 dark:text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {petDetectionError}
            </p>
            {requirePetDetection && petDetectionResult && !petDetectionResult.isPet && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Please choose a different image that clearly shows a pet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Supabase File Uploader */}
      {file && isReadyForUpload && (
        <SupabaseFileUploader
          bucketName={BUCKET_NAMES.PET_PHOTOS}
          folderPath={user?.id}
          onUploadComplete={handleUploadComplete}
          onUploadError={onUploadError}
          showPreview={true}
          additionalMetadata={{
            petDetection: petDetectionResult || undefined,
            userId: user?.id || '',
          }}
        />
      )}
    </div>
  );
} 