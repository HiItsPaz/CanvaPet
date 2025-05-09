/**
 * Error Handling Service
 * 
 * This module provides standardized error handling across the application
 * with consistent error types, status codes, and logging.
 */

import { NextResponse } from 'next/server';

// Standardized application error types
export enum ErrorType {
  // Authentication & Authorization
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  
  // Input validation
  VALIDATION = 'validation_error',
  BAD_REQUEST = 'bad_request',
  
  // Resource errors
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  
  // Rate limiting
  RATE_LIMITED = 'rate_limited',
  
  // Service health
  SERVICE_UNAVAILABLE = 'service_unavailable',
  CIRCUIT_OPEN = 'circuit_breaker_open',
  
  // External services
  EXTERNAL_API = 'external_api_error',
  DATABASE = 'database_error',
  STORAGE = 'storage_error',
  
  // General errors
  INTERNAL = 'internal_error',
  UNKNOWN = 'unknown_error'
}

// Standard error structure
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  retryAfter?: number;
}

// Map error types to HTTP status codes
const errorStatusMap: Record<ErrorType, number> = {
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.VALIDATION]: 400,
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.RATE_LIMITED]: 429,
  [ErrorType.SERVICE_UNAVAILABLE]: 503,
  [ErrorType.CIRCUIT_OPEN]: 503,
  [ErrorType.EXTERNAL_API]: 502,
  [ErrorType.DATABASE]: 500,
  [ErrorType.STORAGE]: 500,
  [ErrorType.INTERNAL]: 500,
  [ErrorType.UNKNOWN]: 500
};

/**
 * Create a standardized app error
 */
export function createError(
  type: ErrorType,
  message: string,
  details?: Record<string, unknown>,
  code?: string,
  retryAfter?: number
): AppError {
  return {
    type,
    message,
    code,
    status: errorStatusMap[type],
    details,
    retryAfter
  };
}

/**
 * Convert any error (including thrown objects and unknown errors) to AppError
 */
export function normalizeError(error: unknown): AppError {
  // Return if already an AppError
  // Type guard for AppError
  const isAppError = (e: unknown): e is AppError => {
    if (e && typeof e === 'object' && 'type' in e) {
      return Object.values(ErrorType).includes((e as { type: ErrorType }).type);
    }
    return false;
  };

  if (isAppError(error)) {
    return error;
  }
  
  // Handle common API error patterns
  // Assuming error is an object for these checks. Add specific type guards if needed.
  const customError = error as { 
    isRateLimited?: boolean; 
    message?: string; 
    code?: string; 
    retryAfter?: number; 
    isCircuitOpen?: boolean; 
    details?: Record<string, unknown>;
    startsWith?: (prefix: string) => boolean; // For error.code.startsWith
  } | null;

  if (customError?.isRateLimited) {
    return createError(
      ErrorType.RATE_LIMITED,
      customError.message || 'Rate limit exceeded. Please try again later.',
      {},
      customError.code || 'rate_limited',
      customError.retryAfter
    );
  }
  
  if (customError?.isCircuitOpen) {
    return createError(
      ErrorType.CIRCUIT_OPEN,
      customError.message || 'Service temporarily unavailable due to multiple failures.',
      {},
      customError.code || 'circuit_open',
      customError.retryAfter
    );
  }
  
  // Handle database errors
  if (customError?.code?.startsWith && customError.code.startsWith('PGRST')) {
    return createError(
      ErrorType.DATABASE,
      customError.message || 'Database operation failed',
      customError.details || {},
      customError.code
    );
  }
  
  // Handle other common errors
  if (error instanceof TypeError || error instanceof RangeError || error instanceof EvalError) {
    return createError(
      ErrorType.INTERNAL,
      error.message || 'An internal error occurred',
      { stack: error.stack } 
    );
  }
  
  // Handle other error objects
  if (error instanceof Error) {
    return createError(
      ErrorType.UNKNOWN,
      error.message || 'An unexpected error occurred',
      { stack: error.stack }
    );
  }
  
  // Handle string error
  if (typeof error === 'string') {
    return createError(
      ErrorType.UNKNOWN,
      error,
      undefined // Explicitly pass undefined for details
    );
  }
  
  // Default for any other errors
  let errorMessage = 'An unexpected error occurred';
  let errorDetails: Record<string, unknown> | undefined = undefined;

  if (typeof error === 'object' && error !== null) {
    errorMessage = (error as { message?: string }).message || errorMessage;
    // Pass the error object itself as details if it's an object
    // We need to ensure it conforms to Record<string, unknown>
    // A simple cast might be too loose, but for now, let's assume it is.
    // Or, be more selective: errorDetails = { originalError: error }; 
    // For simplicity, let's pass it if it's an object. `createError` expects Record<string, unknown> or undefined.
    errorDetails = error as Record<string, unknown>; 
  }

  return createError(
    ErrorType.UNKNOWN,
    errorMessage,
    errorDetails
  );
}

/**
 * Standard error logging
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
  const logLevel = error.status && error.status >= 500 ? 'error' : 'warn';
  const logData = {
    error_type: error.type,
    error_message: error.message,
    error_code: error.code,
    status_code: error.status,
    ...context
  };
  
  if (logLevel === 'error') {
    console.error('Application error:', logData, error.details);
  } else {
    console.warn('Application warning:', logData, error.details);
  }
}

/**
 * Convert AppError to NextResponse for API routes
 */
export function errorResponse(error: AppError | unknown, additionalData?: Record<string, unknown>): NextResponse {
  const appError = (error as AppError).type ? error as AppError : normalizeError(error);
  
  logError(appError);
  
  const payload: Record<string, unknown> = {
    error: appError.message,
    type: appError.type,
    code: appError.code,
    ...additionalData
  };
  
  // Include retryAfter for rate limiting
  if (appError.retryAfter) {
    payload.retryAfter = appError.retryAfter;
  }
  
  // Include error details in development
  if (process.env.NODE_ENV === 'development' && appError.details) {
    payload.details = appError.details;
  }
  
  return NextResponse.json(
    payload,
    { status: appError.status || 500 }
  );
}

/**
 * Error Handler for API Routes
 * Use this as a wrapper for your API route to standardize error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>,
  errorTransform?: (error: unknown) => AppError
): Promise<T | NextResponse> {
  return handler().catch((error) => {
    const appError = errorTransform ? errorTransform(error) : normalizeError(error);
    return errorResponse(appError);
  });
}

// Helper for validation errors
export function validationError(message: string, details?: Record<string, unknown>): AppError {
  return createError(
    ErrorType.VALIDATION,
    message,
    details
  );
}

// Helper for resource not found errors
export function notFoundError(resourceType: string, id?: string): AppError {
  const message = id 
    ? `${resourceType} with ID ${id} not found` 
    : `${resourceType} not found`;
  
  return createError(
    ErrorType.NOT_FOUND,
    message,
    { resourceType, id }
  );
}

// Helper for unauthorized errors
export function unauthorizedError(message: string = 'Unauthorized'): AppError {
  return createError(
    ErrorType.UNAUTHORIZED,
    message
  );
}

// Helper for forbidden errors
export function forbiddenError(message: string = 'You do not have permission to access this resource'): AppError {
  return createError(
    ErrorType.FORBIDDEN,
    message
  );
} 