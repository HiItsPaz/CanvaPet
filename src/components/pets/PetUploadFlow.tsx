"use client";

import { useState, useCallback } from "react";
import { StepProvider, useStepContext } from "@/contexts/StepContext";
import { useStepNavigation, useStepStatus } from "@/contexts/StepContext";
import { StepIndicator, Step, StepStatus } from "@/components/ui/step-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Content components for each step
import { PetPhotoUpload } from "./PetPhotoUpload";
import { PhotoGuidelines } from "./PhotoGuidelines";
import { ImagePreview } from "@/components/ui/image-preview";
import { ImageCropper, CropResult } from "@/components/ui/image-cropper";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingAnimation } from "@/components/ui/loading-animation";

// Type for pet detection result from metadata
interface PetDetectionResult {
  isPet: boolean;
  confidence: number;
  animalType?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  [key: string]: unknown;
}

// Interface for image metadata with validation info
interface ImageMetadata {
  petDetection?: PetDetectionResult;
  validationWarnings?: string[];
  dimensions?: { width: number; height: number };
  quality?: { 
    tooDark?: boolean;
    tooBlurry?: boolean;
    lowResolution?: boolean;
    score?: number;
  };
  validationStatus?: 'passed' | 'warning' | 'failed';
  processingHistory?: Array<{
    cropped?: boolean;
    enhanced?: boolean;
    timestamp: string;
  }>;
  [key: string]: unknown;
}

// Define steps for the pet creation process
const uploadSteps: Step[] = [
  { id: "upload", label: "Upload", status: "pending" },
  { id: "crop", label: "Crop", status: "pending" },
  { id: "preview", label: "Preview", status: "pending" },
  { id: "confirm", label: "Confirm", status: "pending" },
];

// Animation variants for step transitions
const stepVariants = {
  hidden: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.3 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.3 }
  }
};

// Animation variants for notification messages
const notificationVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    height: 0, 
    marginBottom: 0,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    height: "auto",
    marginBottom: 16,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.2 }
  }
};

export default function PetUploadFlow() {
  return (
    <StepProvider initialSteps={uploadSteps} initialStep={0}>
      <PetUploadFlowContent />
    </StepProvider>
  );
}

// Component to display the current step content
function StepContent() {
  const { currentStep } = useStepNavigation();
  const { steps, setStepStatus } = useStepStatus();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedMetadata, setUploadedMetadata] = useState<ImageMetadata | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [showQualityWarnings, setShowQualityWarnings] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update step status when transitioning between steps
  const handleStepChange = useCallback((prevStep: number, newStep: number) => {
    if (prevStep !== newStep) {
      // Mark completed step
      setStepStatus(prevStep, "completed");
      // Mark current step as active
      setStepStatus(newStep, "active");
    }
  }, [setStepStatus]);

  const handleUploadComplete = useCallback((url: string, metadata?: Record<string, unknown>) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setUploadedImageUrl(url);
      if (metadata) {
        setUploadedMetadata(metadata as ImageMetadata);
      }
      setIsProcessing(false);
      
      // Update the step status after successful upload
      setStepStatus(0, "completed");
    }, 1000);
  }, [setStepStatus]);

  const handleUploadError = (errorMessage: string) => {
    console.error("Upload error:", errorMessage);
    setStepStatus(0, "error");
  };

  // Handle crop completion
  const handleCropComplete = useCallback((result: CropResult) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setCroppedImageUrl(result.croppedImageUrl);
      
      // Update metadata to note the image was cropped
      if (uploadedMetadata) {
        setUploadedMetadata({
          ...uploadedMetadata,
          processingHistory: [
            ...(uploadedMetadata.processingHistory || []),
            {
              cropped: true,
              timestamp: new Date().toISOString()
            }
          ]
        });
      }
      
      setIsProcessing(false);
      
      // Update the step status after successful cropping
      setStepStatus(1, "completed");
    }, 1000);
  }, [uploadedMetadata, setStepStatus]);

  // Function to dismiss quality warnings
  const handleDismissWarnings = () => {
    setShowQualityWarnings(false);
  };
  
  // Function to proceed on current step despite warnings
  const handleProceedAnyway = () => {
    const { goToNextStep } = useStepNavigation();
    setShowQualityWarnings(false);
    goToNextStep();
  };

  // Function to save and complete the process
  const handleSaveAndContinue = () => {
    setIsSaving(true);
    
    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false);
      // Mark the final step as completed
      setStepStatus(3, "completed");
      // Provide feedback to the user that the save is complete
      // This could navigate to the next page or show a success message
    }, 2000);
  };

  // Determine which image URL to use
  const displayImageUrl = croppedImageUrl || uploadedImageUrl;
  
  // Determine if there are quality issues to display warnings
  const hasQualityIssues = uploadedMetadata?.validationWarnings && 
                           uploadedMetadata.validationWarnings.length > 0;

  return (
    <div className="space-y-6">
      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingAnimation 
              variant="pet"
              size="lg"
              text="Processing your image..."
              center
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quality warnings notification - shown on preview & confirm steps */}
      <AnimatePresence>
        {hasQualityIssues && showQualityWarnings && currentStep >= 2 && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ErrorMessage
              title="Image Quality Notice"
              message="Your image has some quality issues that might affect the final portrait quality."
              severity="info"
              dismissible
              onDismiss={handleDismissWarnings}
              secondaryAction={{
                label: "Continue Anyway",
                onClick: handleProceedAnyway
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quality warnings detail - shown on preview & confirm steps */}
      <AnimatePresence>
        {hasQualityIssues && showQualityWarnings && currentStep >= 2 && (
          <motion.ul 
            className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800/50 mb-4"
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {uploadedMetadata?.validationWarnings?.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Step content with animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStep}`}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {currentStep === 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <PetPhotoUpload
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  requirePetDetection={true}
                  strictValidation={false}
                />
              </div>
              <div>
                <PhotoGuidelines />
              </div>
            </div>
          )}

          {currentStep === 1 && uploadedImageUrl && (
            <div className="space-y-6">
              <ImageCropper
                imageUrl={uploadedImageUrl}
                aspectRatio="1:1"
                onCropComplete={handleCropComplete}
              />
              <div className="mt-4">
                <PhotoGuidelines compact />
              </div>
            </div>
          )}

          {currentStep === 2 && displayImageUrl && (
            <div className="space-y-6">
              <ImagePreview
                imageUrl={displayImageUrl}
                alt="Pet preview"
                maxHeight={400}
                allowFullscreen
                metadata={uploadedMetadata || undefined}
              />
              
              {/* Quality indicators on preview step */}
              <motion.div
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-medium mb-2">Image Analysis Results</h3>
                
                {/* Pet detection result */}
                {uploadedMetadata?.petDetection && (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400 mb-1">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Pet detected: {uploadedMetadata.petDetection.animalType || "Animal"}
                    {uploadedMetadata.petDetection.confidence ? 
                      ` (${Math.round(uploadedMetadata.petDetection.confidence)}% confidence)` : ""}
                  </div>
                )}
                
                {/* Quality indicators */}
                {hasQualityIssues && (
                  <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Image quality issues detected
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {currentStep === 3 && displayImageUrl && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <ImagePreview
                    imageUrl={displayImageUrl}
                    alt="Final pet image"
                    maxHeight={300}
                    showControls={false}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Confirm Your Pet's Photo</h3>
                  <p>This is the image that will be used to generate your pet's custom portrait.</p>
                  
                  {uploadedMetadata?.petDetection?.isPet && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ✓ Pet detected: {uploadedMetadata.petDetection.animalType || "Animal"} 
                      {uploadedMetadata.petDetection.confidence ? 
                        ` (${Math.round(uploadedMetadata.petDetection.confidence)}% confidence)` : ""}
                    </div>
                  )}
                  
                  {hasQualityIssues && (
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ Note: Some image quality issues were detected. The portrait quality may be affected.
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={handleSaveAndContinue}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <LoadingAnimation variant="spinner" size="sm" /> 
                          <span className="ml-2">Saving...</span>
                        </span>
                      ) : (
                        "Save and Continue"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Main component with step navigation
function PetUploadFlowContent() {
  const { goToNextStep, goToPrevStep, currentStep, isFirstStep, isLastStep } = useStepNavigation();
  const { steps, setStepStatus } = useStepStatus();
  const [isNavigating, setIsNavigating] = useState(false);

  // Enhanced navigation with step status updates
  const handleNextStep = useCallback(() => {
    if (isLastStep) return;
    
    setIsNavigating(true);
    // Update current step status
    setStepStatus(currentStep, "completed");
    // Update next step status
    setStepStatus(currentStep + 1, "active");
    
    // Add a small delay for animation
    setTimeout(() => {
      goToNextStep();
      setIsNavigating(false);
    }, 150);
  }, [currentStep, isLastStep, goToNextStep, setStepStatus]);
  
  const handlePrevStep = useCallback(() => {
    if (isFirstStep) return;
    
    setIsNavigating(true);
    // Update current step status
    setStepStatus(currentStep, "pending");
    // Update previous step status
    setStepStatus(currentStep - 1, "active");
    
    // Add a small delay for animation
    setTimeout(() => {
      goToPrevStep();
      setIsNavigating(false);
    }, 150);
  }, [currentStep, isFirstStep, goToPrevStep, setStepStatus]);

  return (
    <Card className="w-full">
      <div className="p-4 border-b">
        <StepIndicator steps={uploadSteps} currentStep={currentStep} />
      </div>
      <CardContent className="pt-6 relative min-h-[400px]">
        <StepContent />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={isFirstStep || isNavigating}
          className={isFirstStep ? "invisible" : ""}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {/* Hide next button on crop step since it has its own apply button */}
        {currentStep !== 1 && (
          <Button
            onClick={handleNextStep}
            disabled={isLastStep || isNavigating}
            className={isLastStep ? "invisible" : "ml-auto"}
          >
            {isNavigating ? (
              <LoadingAnimation variant="dots" size="sm" />
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 