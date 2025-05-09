"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PreviewProgressProps {
  isGenerating: boolean;
  duration?: number; // Estimated duration in ms
  steps?: string[];
}

export function PreviewProgress({
  isGenerating,
  duration = 2000,
  steps = ["Analyzing pet image", "Applying style", "Adjusting parameters", "Rendering final image"]
}: PreviewProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressText, setProgressText] = useState("");
  
  // Reset progress when generating starts or stops
  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      setCurrentStep(0);
    }
  }, [isGenerating]);
  
  // Handle progress animation
  useEffect(() => {
    if (!isGenerating) return;
    
    const progressInterval = 50; // Update every 50ms for smooth animation
    const progressPerInterval = 100 / (duration / progressInterval);
    
    let currentProgress = 0;
    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
      currentProgress += progressPerInterval;
      
      // Check if we should move to the next step
      const shouldAdvanceStep = currentProgress >= ((currentStepIndex + 1) / steps.length) * 100;
      
      if (shouldAdvanceStep && currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        setCurrentStep(currentStepIndex);
      }
      
      // Update visible progress
      setProgress(Math.min(currentProgress, 99)); // Cap at 99% until complete
      
      // Update progress text
      setProgressText(`${Math.round(currentProgress)}%`);
      
      // Clear interval when done
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, progressInterval);
    
    return () => clearInterval(interval);
  }, [isGenerating, duration, steps]);
  
  if (!isGenerating) return null;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {steps[currentStep]}
        </div>
        <span>{progressText}</span>
      </div>
      
      <Progress value={progress} className="h-2" />
    </div>
  );
} 