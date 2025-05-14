"use client";

import { useState } from "react";
import { ZoomablePreviewDisplay, ProcessingStatus } from "@/components/ui/zoomable-preview-display";
import { ActionPanel, ImageFormat, ImageQuality, SharePlatform } from "@/components/ui/action-panel";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

export interface ProcessingResult {
  id: string;
  originalFileName: string;
  processedFileName: string;
  fileSize: number;
  fileType: string;
  processedAt: string;
  status: string;
  url: string;
  error?: string;
  // Additional metadata fields
  width?: number;
  height?: number;
  processingTime?: number;
  enhancementLevel?: string;
  aiModel?: string;
}

interface ProcessedImageResultProps {
  result: ProcessingResult | null;
  isError: boolean;
  errorMessage?: string;
  onReprocess?: () => void;
  petId?: string;
}

export function ProcessedImageResult({
  result,
  isError,
  errorMessage = "Failed to process image",
  onReprocess,
  petId,
}: ProcessedImageResultProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Extract metadata from processing result
  const metadata = result
    ? {
        "Original File": result.originalFileName,
        "Processed At": new Date(result.processedAt).toLocaleString(),
        "File Size": `${(result.fileSize / 1024 / 1024).toFixed(2)} MB`,
        "Dimensions": result.width && result.height ? `${result.width} × ${result.height} px` : "Unknown",
        ...(result.processingTime ? { "Processing Time": `${result.processingTime.toFixed(2)}s` } : {}),
        ...(result.enhancementLevel ? { "Enhancement Level": result.enhancementLevel } : {}),
        ...(result.aiModel ? { "AI Model": result.aiModel } : {})
      }
    : {};
  
  // Determine status based on result and error state
  const status: ProcessingStatus = 
    isError ? "error" :
    result?.status === "success" ? "success" :
    result?.status === "warning" ? "warning" : 
    null;
  
  // Handle download with format and quality options
  const handleDownload = async (format: ImageFormat, quality: ImageQuality) => {
    if (!result?.url) {
      toast({
        title: "Download Error",
        description: "Image URL is not available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "Preparing Download",
        description: `Processing your ${format.toUpperCase()} file with ${quality} quality`,
      });
      
      // The ActionPanel component already handles the download with format conversion
      // No additional implementation needed here as it's handled by the component
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Download Failed",
        description: "There was an error preparing your download",
        variant: "destructive",
      });
    }
  };
  
  // Handle share with platform selection
  const handleShare = async (platform: SharePlatform) => {
    if (!result?.url) {
      toast({
        title: "Sharing Error",
        description: "Image URL is not available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // For analytics tracking or custom share behavior
      toast({
        title: `Sharing to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        description: "Preparing your content for sharing",
      });
      
      // The actual sharing functionality is handled by the ActionPanel component
    } catch (error) {
      console.error("Error sharing image:", error);
      toast({
        title: "Sharing Failed",
        description: "There was an error preparing your content for sharing",
        variant: "destructive",
      });
    }
  };
  
  // Handle continue to customization
  const handleContinue = () => {
    if (!petId) return;
    
    setIsNavigating(true);
    router.push(`/pets/${petId}/customize`);
  };
  
  if (!result && !isError) {
    return null;
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <ZoomablePreviewDisplay
        imageUrl={result?.url || "/placeholder-error.jpg"}
        alt={result?.originalFileName || "Processed pet image"}
        title="Processed Image Result"
        description={
          isError
            ? "There was an issue processing your image"
            : "Your pet image has been successfully processed and is ready for customization"
        }
        status={status}
        statusMessage={isError ? errorMessage : undefined}
        onReprocess={isError ? onReprocess : undefined}
        metadata={Object.keys(metadata).length > 0 ? metadata : undefined}
        maxHeight={500}
        hideControls={!isError} // Hide default controls when showing action panel
      />
      
      {!isError && result?.url && (
        <ActionPanel
          imageUrl={result.url}
          title="Pet Portrait"
          description="Download or share your processed pet portrait"
          onDownload={handleDownload}
          onShare={handleShare}
          className="mt-6"
        />
      )}
      
      {!isError && petId && (
        <div className="mt-6 flex justify-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={isNavigating}
            className="w-full max-w-md"
          >
            {isNavigating ? "Navigating..." : "Continue to Customization"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      {isError && !onReprocess && (
        <div className="mt-6 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full max-w-md">
                <AlertCircle className="mr-2 h-4 w-4" />
                Back to Upload
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard Failed Processing?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll be returned to the upload page. Any uploaded image data will be discarded.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push('/pets/upload')}>
                  Return to Upload
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
} 