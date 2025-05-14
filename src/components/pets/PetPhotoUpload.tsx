"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MAX_FILE_SIZE, 
  validateFile,
  validateImageWithQuality,
  getReadableValidationWarnings
} from '@/lib/imageUtils';
import { checkIsPet, formatPetDetectionResult } from '@/lib/petUtils';
import { SupabaseFileUploader } from './SupabaseFileUploader';
import { BUCKET_NAMES } from '@/lib/storageUtils';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { motion, AnimatePresence } from 'framer-motion';

// Define a type for pet detection results
interface PetDetectionResult {
  isPet: boolean;
  confidence: number;
  animalType?: string;
  [key: string]: unknown;
}

// Define a type for validation results
interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings: string[];
  dimensions?: { width: number; height: number };
  quality?: { 
    tooDark?: boolean;
    tooBlurry?: boolean;
    lowResolution?: boolean; 
  };
}

interface PetPhotoUploadProps {
  onUploadComplete?: (url: string, metadata?: Record<string, unknown>) => void;
  onUploadError?: (error: string) => void;
  requirePetDetection?: boolean;
  strictValidation?: boolean;
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export function PetPhotoUpload({
  onUploadComplete,
  onUploadError,
  requirePetDetection = true,
  strictValidation = false,
}: PetPhotoUploadProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDetectingPet, setIsDetectingPet] = useState(false);
  const [petDetectionResult, setPetDetectionResult] = useState<PetDetectionResult | null>(null);
  const [petDetectionError, setPetDetectionError] = useState<string | null>(null);
  const [isReadyForUpload, setIsReadyForUpload] = useState(false);
  
  // Add states for enhanced validation
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showQualityWarnings, setShowQualityWarnings] = useState(true);
  const [humanReadableWarnings, setHumanReadableWarnings] = useState<string[]>([]);

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
      setFile(file);
      
      // Reset states
      setPetDetectionResult(null);
      setPetDetectionError(null);
      setValidationResult(null);
      setHumanReadableWarnings([]);
      setIsReadyForUpload(false);
      
      try {
        // Validate the file with enhanced checks
        setIsValidating(true);
        const validation = await validateImageWithQuality(file, {
          checkDimensions: true,
          checkQuality: true,
          strictValidation: strictValidation
        });
        setValidationResult(validation);
        
        // Generate human-readable warnings
        if (validation.valid && validation.warnings.length > 0) {
          const readableWarnings = getReadableValidationWarnings(validation);
          setHumanReadableWarnings(readableWarnings);
        }
        
        // If basic validation fails, stop here
        if (!validation.valid) {
          onUploadError?.(validation.error || 'Invalid file');
          return;
        }
        
        // Perform pet detection if required
        if (requirePetDetection) {
          try {
            setIsDetectingPet(true);
            // Type assertion via unknown to bypass type checking for incompatible types
            const result = await checkIsPet(file) as unknown as PetDetectionResult;
            setPetDetectionResult(result);
            
            // Determine if file is ready for upload based on pet detection
            const isPetDetected = result.isPet;
            
            if (isPetDetected) {
              setIsReadyForUpload(true);
            } else {
              setPetDetectionError("No pet detected in this image. Please upload a photo of your pet.");
              setIsReadyForUpload(!strictValidation); // Only block if strict validation is enabled
            }
          } catch (err: unknown) {
            console.error('Pet detection error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setPetDetectionError(`Pet detection failed: ${errorMessage}`);
            // Don't block upload if detection fails, allow proceeding
            setIsReadyForUpload(!strictValidation);
          } finally {
            setIsDetectingPet(false);
          }
        } else {
          // No pet detection required, ready for upload
          setIsReadyForUpload(true);
        }
      } catch (err) {
        console.error('Validation error:', err);
        onUploadError?.(err instanceof Error ? err.message : 'Unexpected validation error');
      } finally {
        setIsValidating(false);
      }
    },
    [user, onUploadError, requirePetDetection, strictValidation]
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

  // Handler for retry action
  const handleRetryUpload = useCallback(() => {
    setFile(null);
    setPetDetectionResult(null);
    setPetDetectionError(null);
    setValidationResult(null);
    setHumanReadableWarnings([]);
    setIsReadyForUpload(false);
  }, []);

  // Handler for proceeding despite warnings
  const handleProceedAnyway = useCallback(() => {
    // If strict validation and pet detection is required but no pet detected, still block
    if (strictValidation && requirePetDetection && petDetectionResult && !petDetectionResult.isPet) {
      return;
    }
    
    // Otherwise allow proceeding despite warnings
    setIsReadyForUpload(true);
    setShowQualityWarnings(false);
  }, [petDetectionResult, requirePetDetection, strictValidation]);

  // Handle upload completion
  const handleUploadComplete = useCallback((url: string, metadata: Record<string, unknown>) => {
    // Generate a validation status for metadata
    let validationStatus: 'passed' | 'warning' | 'failed' = 'passed';
    
    // Check for warnings
    if (validationResult?.warnings && validationResult.warnings.length > 0) {
      validationStatus = 'warning';
    }
    
    // Check pet detection
    if (requirePetDetection && petDetectionResult && !petDetectionResult.isPet) {
      validationStatus = 'warning';
    }
    
    // Add all metadata to the result
    const completeMetadata = {
      ...metadata,
      petDetection: petDetectionResult || undefined,
      validationWarnings: humanReadableWarnings.length > 0 ? humanReadableWarnings : validationResult?.warnings || [],
      dimensions: validationResult?.dimensions,
      quality: validationResult?.quality,
      validationStatus
    };
    
    // Pass the URL and metadata to the parent component
    onUploadComplete?.(url, completeMetadata);
    
    // Reset state for next upload
    setFile(null);
    setPetDetectionResult(null);
    setPetDetectionError(null);
    setValidationResult(null);
    setHumanReadableWarnings([]);
    setIsReadyForUpload(false);
    setShowQualityWarnings(true);
  }, [onUploadComplete, petDetectionResult, validationResult, humanReadableWarnings, requirePetDetection]);

  return (
    <div className="w-full space-y-4">
      {/* Dropzone Area */}
      <AnimatePresence>
        {!file && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
          >
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}`}
            >
              <input {...getInputProps()} />
              <motion.div 
                className="flex flex-col items-center justify-center space-y-2"
                initial={{ scale: 1 }}
                animate={{ 
                  scale: isDragActive ? 1.05 : 1,
                  y: isDragActive ? -5 : 0
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="p-3 rounded-full bg-primary/10"
                  animate={{ 
                    backgroundColor: isDragActive ? 'rgba(var(--primary), 0.2)' : 'rgba(var(--primary), 0.1)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: isDragActive ? [0, -10, 10, -10, 0] : 0 
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <ImageIcon
                      className="w-6 h-6 text-primary"
                    />
                  </motion.div>
                </motion.div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? 'Drop the pet photo here...'
                    : 'Drag & drop a pet photo, or click to select one'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Supported formats: JPG, PNG, WebP (Max 10MB)
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading States */}
      <AnimatePresence>
        {(isValidating || isDetectingPet) && (
          <motion.div 
            className="p-4 border rounded-lg bg-muted"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-center space-x-2">
              <LoadingAnimation 
                variant={isDetectingPet ? "pet" : "spinner"} 
                size="sm" 
                text={isValidating ? 'Validating image...' : 'Analyzing image for pets...'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Error Message */}
      <AnimatePresence>
        {validationResult && !validationResult.valid && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ErrorMessage
              title="Image Validation Failed"
              message={validationResult.error || 'The image failed validation checks.'}
              severity="error"
              recoveryAction={{
                label: 'Try Different Image',
                onClick: handleRetryUpload
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quality Warning Message */}
      <AnimatePresence>
        {validationResult && validationResult.valid && humanReadableWarnings.length > 0 && showQualityWarnings && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ErrorMessage
              title="Image Quality Warning"
              message={`We noticed some issues with your image that might affect portrait quality:`}
              severity="warning"
              recoveryAction={{
                label: 'Try Different Image',
                onClick: handleRetryUpload
              }}
              secondaryAction={{
                label: 'Use Anyway',
                onClick: handleProceedAnyway
              }}
              dismissible
              onDismiss={() => setShowQualityWarnings(false)}
              className="mb-2"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* List of quality warnings */}
      <AnimatePresence>
        {validationResult && validationResult.valid && humanReadableWarnings.length > 0 && showQualityWarnings && (
          <motion.ul 
            className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800/50"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ delayChildren: 0.1, staggerChildren: 0.05 }}
          >
            {humanReadableWarnings.map((warning, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {warning}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Pet Detection Error */}
      <AnimatePresence>
        {petDetectionError && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ErrorMessage
              title={requirePetDetection && strictValidation ? 'Pet Detection Failed' : 'Pet Detection Warning'}
              message={petDetectionError}
              severity={requirePetDetection && strictValidation && petDetectionResult && !petDetectionResult.isPet ? 'error' : 'warning'}
              recoveryAction={{
                label: 'Try Different Image',
                onClick: handleRetryUpload
              }}
              secondaryAction={
                !(requirePetDetection && strictValidation) || !petDetectionResult || petDetectionResult.isPet
                  ? {
                      label: 'Continue Anyway',
                      onClick: handleProceedAnyway
                    }
                  : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supabase File Uploader */}
      <AnimatePresence>
        {file && isReadyForUpload && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <SupabaseFileUploader
              bucketName={BUCKET_NAMES.PET_PHOTOS}
              folderPath={user?.id}
              onUploadComplete={handleUploadComplete}
              onUploadError={onUploadError}
              showPreview={true}
              additionalMetadata={{
                petDetection: petDetectionResult || undefined,
                validationWarnings: humanReadableWarnings.length > 0 ? humanReadableWarnings : validationResult?.warnings || [],
                dimensions: validationResult?.dimensions,
                quality: validationResult?.quality,
                userId: user?.id || '',
                validationStatus: validationResult?.warnings?.length ? 'warning' : 'passed'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 