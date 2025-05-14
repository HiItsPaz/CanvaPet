"use client";

import React, { useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { useProcessingState } from '@/hooks/use-processing-state';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export type AnimationTheme = 'default' | 'pet' | 'dog' | 'cat' | 'rabbit';

export interface ProcessingAnimationProps {
  /**
   * The state of the animation
   */
  state?: 'initial' | 'processing' | 'complete' | 'error';
  /**
   * Alternative property name for state (for compatibility)
   */
  status?: 'initial' | 'processing' | 'complete' | 'error';
  /**
   * The current progress of the animation (0-100)
   */
  progress?: number;
  /**
   * Visual theme for the animation (theme is still here for potential future use or other styling)
   */
  theme?: AnimationTheme;
  /**
   * The size of the animation
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Whether to show when in initial state
   */
  showInitial?: boolean;
  /**
   * Message to display below the animation
   */
  message?: string;
  /**
   * Callback when animation completes
   */
  onComplete?: () => void;
}

// Functional component for progress bar display
function ProgressBar({ 
  progress = 0, 
  determinate = true, 
  className,
  progressText 
}: { 
  progress: number; 
  determinate?: boolean; 
  className?: string;
  progressText?: string;
}) {
  // Ensure progress is between 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={cn("w-full mt-3", className)}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 overflow-hidden">
        {determinate ? (
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${clampedProgress}%` }}
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        ) : (
          <div 
            className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"
            role="progressbar"
            aria-valuetext="Loading..."
          />
        )}
      </div>
      {(determinate || progressText) && (
        <div className="text-xs text-gray-500 text-center" aria-live="polite">
          {progressText || `${clampedProgress}%`}
        </div>
      )}
    </div>
  );
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
};

function ProcessingAnimationBase({ 
  state = 'processing',
  status,
  progress = 0,
  size = 'md',
  className,
  showInitial = true,
  message,
  onComplete,
  ...restProps
}: ProcessingAnimationProps) {
  const isMounted = useIsMounted();
  const prefersReducedMotion = useReducedMotion();
  const [processingState] = useProcessingState();

  // Use status if provided, otherwise fall back to state
  const currentState = status || state || processingState.status;
  const currentProgress = progress || processingState.progress || 0;

  // Handle animation complete
  useEffect(() => {
    if (currentState === 'complete' && onComplete && isMounted) {
      onComplete();
    }
  }, [currentState, onComplete, isMounted]);

  const displayIndicator = 
    (currentState === 'processing' || currentState === 'complete' || currentState === 'error') ||
    (currentState === 'initial' && showInitial);

  const currentSize = sizeMap[size];

  // Determine progress bar visibility
  const showProgressBar = currentState === 'processing';
  const isDeterminate = state === 'processing' && typeof progress === 'number' && progress >= 0;

  if (!displayIndicator || prefersReducedMotion) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        className,
        `w-[${currentSize}px] h-[${currentSize}px]` // Apply size to container
      )} {...restProps}>
        {message && <p className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">{message}</p>}
        {showProgressBar && <ProgressBar progress={currentProgress} determinate={isDeterminate} progressText={message} />}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      className,
      `w-[${currentSize}px] h-[${currentSize}px]` // Apply size to container
    )} {...restProps}>
      <div className={cn(
        "rounded-full",
        currentState === 'initial' ? "bg-gray-300" :
        currentState === 'processing' ? "bg-blue-500 animate-pulse" :
        currentState === 'complete' ? "bg-green-500" :
        "bg-red-500",
        size === 'sm' ? "w-8 h-8" : size === 'lg' ? "w-16 h-16" : "w-12 h-12"
      )}></div>

      {message && (
        <p className={cn("text-center text-sm text-muted-foreground mt-2 leading-relaxed", showProgressBar && "sr-only")}>{message}</p>
      )}
      {showProgressBar && <ProgressBar progress={currentProgress} determinate={isDeterminate} progressText={message} />}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const ProcessingAnimation = memo(ProcessingAnimationBase); 