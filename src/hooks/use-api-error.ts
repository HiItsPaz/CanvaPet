'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface ApiErrorState {
  error: Error | null;
  message: string | null;
  code?: string | number;
  isLoading: boolean;
  retryCount: number;
}

export interface ApiErrorOptions {
  maxRetries?: number;
  retryDelay?: number; // in ms
  shouldAutoRetry?: boolean;
  toastErrors?: boolean;
  formatErrorMessage?: (error: any) => string;
}

/**
 * A hook for handling API errors with retry functionality
 * and user-friendly error messages
 * 
 * @param options Configuration options
 * @returns Functions and state for managing API errors
 */
export function useApiError(options: ApiErrorOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    shouldAutoRetry = false,
    toastErrors = true,
    formatErrorMessage = defaultFormatErrorMessage,
  } = options;
  
  const { toast } = useToast();
  
  const [state, setState] = useState<ApiErrorState>({
    error: null,
    message: null,
    code: undefined,
    isLoading: false,
    retryCount: 0,
  });
  
  /**
   * Reset the error state
   */
  const resetError = useCallback(() => {
    setState({
      error: null,
      message: null,
      code: undefined,
      isLoading: false,
      retryCount: 0,
    });
  }, []);
  
  /**
   * Handle an API error
   */
  const handleError = useCallback((error: any) => {
    // Extract error details
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const code = error.code || error.status || error.statusCode;
    
    // Format user-friendly message
    const message = formatErrorMessage(error);
    
    // Set error state
    setState(prev => ({
      error: errorObj,
      message,
      code,
      isLoading: false,
      retryCount: prev.retryCount,
    }));
    
    // Show toast if enabled
    if (toastErrors) {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    
    return { error: errorObj, message, code };
  }, [formatErrorMessage, toast, toastErrors]);
  
  /**
   * Retry a function after an API error
   */
  const retryAfterError = useCallback(async <T>(
    fn: () => Promise<T>,
    customMaxRetries?: number
  ): Promise<T> => {
    const retriesLeft = customMaxRetries ?? maxRetries;
    const currentRetry = state.retryCount + 1;
    
    if (currentRetry > retriesLeft) {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      throw new Error(`Maximum retry attempts (${retriesLeft}) exceeded`);
    }
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      retryCount: currentRetry,
    }));
    
    // Exponential backoff
    const delay = retryDelay * Math.pow(2, currentRetry - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const result = await fn();
      resetError();
      return result;
    } catch (err) {
      handleError(err);
      
      if (shouldAutoRetry) {
        return retryAfterError(fn, retriesLeft);
      }
      
      throw err;
    }
  }, [handleError, maxRetries, resetError, retryDelay, shouldAutoRetry, state.retryCount]);
  
  /**
   * Wrap an API call with error handling
   */
  const withErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
    }));
    
    try {
      const result = await fn();
      resetError();
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [handleError, resetError]);
  
  return {
    ...state,
    handleError,
    resetError,
    retryAfterError,
    withErrorHandling,
  };
}

/**
 * Default function to format error messages
 * Extracts user-friendly messages from common API error patterns
 */
function defaultFormatErrorMessage(error: any): string {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle standard API errors
  if (error.message) {
    return error.message;
  }
  
  // Handle Axios/Fetch like errors
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Handle HTTP status codes with standard messages
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    switch (status) {
      case 400: return 'Bad request. Please check your input.';
      case 401: return 'You need to be logged in to perform this action.';
      case 403: return 'You don\'t have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 422: return 'The data provided is invalid.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'An unexpected server error occurred. Please try again later.';
      default: return `Request failed with status code ${status}`;
    }
  }
  
  // Fallback for unknown error formats
  return 'An unknown error occurred. Please try again.';
} 