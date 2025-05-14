"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

export type ProcessingStatus = 'initial' | 'processing' | 'complete' | 'error';

export interface ProcessingOptions {
  // Initial status - optional, defaults to 'initial'
  initialStatus?: ProcessingStatus;
  // Initial message - optional, defaults to 'Preparing...'
  initialMessage?: string;
  // Processing message - optional, defaults to 'Processing...'
  processingMessage?: string;
  // Success message - optional, defaults to 'Completed successfully!'
  successMessage?: string;
  // Error message - optional, defaults to 'An error occurred'
  errorMessage?: string;
  // Default timeout in milliseconds - optional, defaults to 30000 (30 seconds)
  timeout?: number;
  // Auto-reset after completion (success or error) - optional, defaults to false
  autoReset?: boolean;
  // Auto-reset delay in milliseconds - optional, defaults to 3000 (3 seconds)
  resetDelay?: number;
  // If true, the hook will start in processing state - optional, defaults to false
  startImmediately?: boolean;
  // If true, errors will be caught internally and state will be set to 'error'
  // If false, errors will be re-thrown - optional, defaults to true
  catchErrors?: boolean;
  // If provided, this function will be called when an error occurs
  onError?: (error: Error) => void;
  // If provided, this function will be called when processing completes successfully
  onSuccess?: (result: any) => void;
  // If provided, this function will be called when processing is started
  onStart?: () => void;
}

export interface ProcessingState {
  // Current status: 'initial', 'processing', 'complete', 'error'
  status: ProcessingStatus;
  // Current message to display to the user
  message: string;
  // Progress value between 0-100, or undefined if not applicable
  progress?: number;
  // Raw error object if status is 'error'
  error?: Error;
  // Result of the operation if status is 'complete'
  result?: any;
  // Whether the operation is determinate (has a specific progress value)
  determinate: boolean;
  // Whether the operation is currently processing
  isProcessing: boolean;
  // Whether the operation has completed (successfully or with error)
  isComplete: boolean;
  // Whether the operation has completed successfully
  isSuccess: boolean;
  // Whether the operation has failed
  isError: boolean;
}

export interface ProcessingStateControls {
  // Start processing with an optional operation
  startProcessing: (operation?: Promise<any>) => Promise<any>;
  // Update progress (0-100)
  updateProgress: (progressValue: number, progressMessage?: string) => void;
  // Mark processing as complete with an optional result and message
  completeProcessing: (result?: any, message?: string) => void;
  // Mark processing as failed with an error
  failProcessing: (error: Error | string, message?: string) => void;
  // Reset to initial state
  reset: (message?: string) => void;
  // Cancel current operation (if supported)
  cancel: () => void;
}

/**
 * Hook to manage loading states, progress tracking, and error handling
 * for asynchronous operations like API calls and data processing.
 */
export function useProcessingState(options: ProcessingOptions = {}): [ProcessingState, ProcessingStateControls] {
  const {
    initialStatus = 'initial',
    initialMessage = 'Preparing...',
    processingMessage = 'Processing...',
    successMessage = 'Completed successfully!',
    errorMessage = 'An error occurred',
    timeout = 30000,
    autoReset = false,
    resetDelay = 3000,
    startImmediately = false,
    catchErrors = true,
    onError,
    onSuccess,
    onStart,
  } = options;
  
  // State
  const [status, setStatus] = useState<ProcessingStatus>(
    startImmediately ? 'processing' : initialStatus
  );
  const [message, setMessage] = useState<string>(
    startImmediately ? processingMessage : initialMessage
  );
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [result, setResult] = useState<any>(undefined);
  const [determinate, setDeterminate] = useState<boolean>(false);
  
  // Refs to hold the current operation and timeout
  const currentOperationRef = useRef<Promise<any> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Helper to clean up timeouts and references
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (autoResetTimeoutRef.current) {
      clearTimeout(autoResetTimeoutRef.current);
      autoResetTimeoutRef.current = null;
    }
    
    currentOperationRef.current = null;
    
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        console.error('Error aborting operation:', e);
      }
      abortControllerRef.current = null;
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // Auto-reset after completion
  useEffect(() => {
    if (autoReset && (status === 'complete' || status === 'error')) {
      autoResetTimeoutRef.current = setTimeout(() => {
        setStatus('initial');
        setMessage(initialMessage);
        setProgress(undefined);
        setError(undefined);
        setResult(undefined);
        setDeterminate(false);
      }, resetDelay);
    }
    
    return () => {
      if (autoResetTimeoutRef.current) {
        clearTimeout(autoResetTimeoutRef.current);
      }
    };
  }, [autoReset, resetDelay, status, initialMessage]);
  
  // Start processing with an optional operation
  const startProcessing = useCallback(async (operation?: Promise<any>) => {
    // Clean up any existing operations
    cleanup();
    
    // Create a new AbortController if we have an operation
    if (operation) {
      abortControllerRef.current = new AbortController();
    }
    
    // Set initial processing state
    setStatus('processing');
    setMessage(processingMessage);
    setProgress(undefined);
    setDeterminate(false);
    setError(undefined);
    setResult(undefined);
    
    // Call onStart callback if provided
    if (onStart) {
      onStart();
    }
    
    // If no operation is provided, just update state and return
    if (!operation) {
      return;
    }
    
    // Store the current operation
    currentOperationRef.current = operation;
    
    // Set up timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        const timeoutError = new Error('Operation timed out');
        setStatus('error');
        setMessage(errorMessage);
        setError(timeoutError);
        setProgress(undefined);
        
        // Call onError callback if provided
        if (onError) {
          onError(timeoutError);
        }
        
        if (abortControllerRef.current) {
          try {
            abortControllerRef.current.abort();
          } catch (e) {
            console.error('Error aborting operation on timeout:', e);
          }
        }
      }, timeout);
    }
    
    try {
      // Await the operation
      const result = await operation;
      
      // Check if the component is still mounted and this is still the current operation
      if (currentOperationRef.current === operation) {
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Update state
        setStatus('complete');
        setMessage(successMessage);
        setResult(result);
        setProgress(100);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      }
    } catch (err) {
      // Check if the component is still mounted and this is still the current operation
      if (currentOperationRef.current === operation) {
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Convert to Error if it's not already
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Update state
        setStatus('error');
        setMessage(typeof err === 'string' ? err : errorMessage);
        setError(error);
        setProgress(undefined);
        
        // Call onError callback if provided
        if (onError) {
          onError(error);
        }
        
        // Re-throw if not catching errors
        if (!catchErrors) {
          throw error;
        }
        
        return undefined;
      }
    } finally {
      if (currentOperationRef.current === operation) {
        currentOperationRef.current = null;
        abortControllerRef.current = null;
      }
    }
  }, [cleanup, processingMessage, onStart, timeout, errorMessage, onError, catchErrors, successMessage, onSuccess]);
  
  // Update progress
  const updateProgress = useCallback((progressValue: number, progressMessage?: string) => {
    setProgress(Math.max(0, Math.min(100, progressValue)));
    setDeterminate(true);
    if (progressMessage) {
      setMessage(progressMessage);
    }
  }, []);
  
  // Mark processing as complete
  const completeProcessing = useCallback((result?: any, message?: string) => {
    setStatus('complete');
    setMessage(message || successMessage);
    setProgress(100);
    setResult(result);
    
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess(result);
    }
    
    cleanup();
  }, [successMessage, onSuccess, cleanup]);
  
  // Mark processing as failed
  const failProcessing = useCallback((error: Error | string, message?: string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    setStatus('error');
    setMessage(message || errorMessage);
    setError(errorObj);
    setProgress(undefined);
    
    // Call onError callback if provided
    if (onError) {
      onError(errorObj);
    }
    
    cleanup();
  }, [errorMessage, onError, cleanup]);
  
  // Reset to initial state
  const reset = useCallback((message?: string) => {
    setStatus('initial');
    setMessage(message || initialMessage);
    setProgress(undefined);
    setDeterminate(false);
    setError(undefined);
    setResult(undefined);
    
    cleanup();
  }, [initialMessage, cleanup]);
  
  // Cancel current operation
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        console.error('Error cancelling operation:', e);
      }
    }
    
    reset();
  }, [reset]);
  
  // Derived state
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete' || status === 'error';
  const isSuccess = status === 'complete';
  const isError = status === 'error';
  
  // Start immediately if requested
  useEffect(() => {
    if (startImmediately) {
      startProcessing();
    }
  }, [startImmediately, startProcessing]);
  
  return [
    {
      status,
      message,
      progress,
      error,
      result,
      determinate,
      isProcessing,
      isComplete,
      isSuccess,
      isError
    },
    {
      startProcessing,
      updateProgress,
      completeProcessing,
      failProcessing,
      reset,
      cancel
    }
  ];
} 