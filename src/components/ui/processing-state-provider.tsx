"use client";

import React, { useEffect, ReactNode } from 'react';
import { ProcessingAnimation, ProcessingAnimationProps } from '@/components/ui/processing-animation';
import { 
  useProcessingState, 
  ProcessingOptions, 
  ProcessingState, 
  ProcessingStateControls 
} from '@/hooks/use-processing-state';

export interface ProcessingStateProviderProps extends Omit<ProcessingAnimationProps, 'status' | 'progress' | 'determinate' | 'progressText'> {
  children?: ReactNode;
  options?: ProcessingOptions;
  operation?: Promise<unknown>;
  renderContent?: (state: ProcessingState, controls: ProcessingStateControls) => ReactNode;
  onStateChange?: (state: ProcessingState) => void;
  hideAnimation?: boolean;
  customProgressText?: (state: ProcessingState) => string | undefined;
  // For future extensibility, but removed to avoid linter issues
  // renderOptions?: unknown; 
  // cacheKey?: string; 
}

/**
 * A component that integrates ProcessingAnimation with the useProcessingState hook.
 * Can be used to easily wrap async operations with loading states, progress tracking,
 * and error handling.
 */
export function ProcessingStateProvider({
  children,
  options,
  operation,
  renderContent,
  onStateChange,
  hideAnimation = false,
  message,
  className,
  onComplete,
  size,
  // renderOptions and cacheKey removed from destructuring
  ...restProps
}: ProcessingStateProviderProps) {
  const [state, controls] = useProcessingState(options);
  
  // Call onStateChange callback when state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);
  
  // Start processing with the given operation if provided
  useEffect(() => {
    if (operation) {
      controls.startProcessing(operation)
        .catch(error => console.error('Operation failed:', error));
    }
  }, [operation, controls]);
  
  return (
    <div className="processing-state-provider">
      {!hideAnimation && (
        <ProcessingAnimation
          status={state.status}
          message={message ?? state.message}
          progress={state.progress}
          className={className}
          onComplete={onComplete}
          size={size}
          // Omit renderOptions and cacheKey as they're not in the ProcessingAnimation interface
          {...restProps}
        />
      )}
      
      {renderContent ? renderContent(state, controls) : children}
    </div>
  );
}

/**
 * A higher-order component (HOC) that wraps a component with ProcessingStateProvider
 * and passes processing state and controls as props.
 */
export function withProcessingState<P extends object>(
  Component: React.ComponentType<P & { 
    processingState: ProcessingState; 
    processingControls: ProcessingStateControls 
  }>,
  defaultOptions?: ProcessingOptions
) {
  return function WithProcessingState(props: P & { processingOptions?: ProcessingOptions }) {
    const { processingOptions, ...rest } = props;
    const [state, controls] = useProcessingState({
      ...defaultOptions,
      ...processingOptions
    });
    
    return (
      <Component
        {...rest as P}
        processingState={state}
        processingControls={controls}
      />
    );
  };
} 