/**
 * Supabase Error Handling
 * 
 * This module provides specialized error handling for Supabase operations
 * integrating with the main error handling service.
 */

import { PostgrestError, AuthError } from '@supabase/supabase-js';
import { ErrorType, createError, AppError } from '@/lib/errorHandling';

// Common Supabase error codes and their meanings
const SUPABASE_ERROR_CODES = {
  '23505': 'unique_violation',        // Unique constraint violation
  '23503': 'foreign_key_violation',   // Foreign key violation
  '23502': 'not_null_violation',      // Not null constraint
  '42P01': 'undefined_table',         // Table does not exist
  '42703': 'undefined_column',        // Column does not exist
  '22P02': 'invalid_text_representation', // Invalid input syntax
  '22003': 'numeric_value_out_of_range', // Numeric value out of range
  '42P04': 'duplicate_database',      // Duplicate database
  '42601': 'syntax_error',            // Syntax error in SQL
  '40001': 'serialization_failure',   // Serialization failure
  '40P01': 'deadlock_detected',       // Deadlock detected
  // RLS policy errors
  'PGRST301': 'permission_denied',    // RLS policy evaluation returned false
  'PGRST116': 'role_not_found',       // Role not found
};

/**
 * Convert PostgrestError to AppError
 */
export function handlePostgrestError(error: PostgrestError): AppError {
  // Extract Postgres error code from details.code if it exists
  const pgErrorCode = error.details?.includes('Error code: ') 
    ? error.details.split('Error code: ')[1].split(' ')[0]
    : null;
    
  // Get normalized error code
  const errorCode = pgErrorCode && SUPABASE_ERROR_CODES[pgErrorCode as keyof typeof SUPABASE_ERROR_CODES]
    ? SUPABASE_ERROR_CODES[pgErrorCode as keyof typeof SUPABASE_ERROR_CODES]
    : error.code;
  
  // Handle specific error types
  if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
    return createError(
      ErrorType.FORBIDDEN,
      'You do not have permission to perform this operation',
      { pgError: error.details },
      errorCode
    );
  }
  
  if (error.code?.startsWith('PGRST') && error.message?.includes('invalid input syntax')) {
    return createError(
      ErrorType.VALIDATION,
      'Invalid data format',
      { pgError: error.details },
      errorCode
    );
  }
  
  if (pgErrorCode === '23505') {
    return createError(
      ErrorType.CONFLICT,
      'This record already exists',
      { pgError: error.details },
      errorCode
    );
  }
  
  if (pgErrorCode === '23503') {
    return createError(
      ErrorType.VALIDATION,
      'Referenced record does not exist',
      { pgError: error.details },
      errorCode
    );
  }
  
  // Default database error
  return createError(
    ErrorType.DATABASE,
    error.message || 'Database operation failed',
    { pgError: error.details },
    errorCode
  );
}

/**
 * Safe wrapper for Supabase operations with standardized error handling
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T> {
  const { data, error } = await operation();
  
  if (error) {
    throw handlePostgrestError(error);
  }
  
  if (data === null) {
    throw createError(
      ErrorType.NOT_FOUND,
      'Resource not found',
      {},
      'not_found'
    );
  }
  
  return data;
}

/**
 * Safe wrapper for Supabase query that may return no results without error
 */
export async function safeSupabaseQuery<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T | null> {
  const { data, error } = await operation();
  
  if (error) {
    throw handlePostgrestError(error);
  }
  
  return data;
}

/**
 * Safe wrapper for Supabase methods that use a different response format 
 * (like auth methods that don't follow the {data, error} pattern)
 */
export async function safeSupabaseAuth<T, E = AuthError | Error | null>(
  operation: () => Promise<{ data: { [key: string]: T }; error: E  }>
): Promise<T> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      let message = 'Authentication failed';
      let errorCode = 'auth_error';

      if (error instanceof AuthError) {
        message = error.message;
        errorCode = error.code || errorCode;
        if (error.message?.includes('Email not confirmed')) {
          errorCode = 'email_not_confirmed';
        }
        if (error.message?.includes('Invalid login credentials')) {
          errorCode = 'invalid_credentials';
        }
      } else if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // After 'message' in error check, we can cast to { message: unknown }
        // and then check if message is string
        const potentialErrorWithMessage = error as { message?: unknown, code?: unknown }; 
        if (typeof potentialErrorWithMessage.message === 'string') {
          message = potentialErrorWithMessage.message;
        }
        // Check for code property similarly
        if ('code' in error && typeof potentialErrorWithMessage.code === 'string') {
            errorCode = potentialErrorWithMessage.code;
        }
      }
      
      throw createError(ErrorType.UNAUTHORIZED, message, {}, errorCode);
    }
    
    if (!data) {
        throw createError(ErrorType.INTERNAL, 'No data returned from auth operation');
    }

    const responseKey = Object.keys(data)[0];
    if (responseKey === undefined) {
        throw createError(ErrorType.INTERNAL, 'Auth operation returned empty data object');
    }
    return data[responseKey] as T;
  } catch (error) {
    if ((error as AppError).type) {
      throw error;
    }
    
    throw createError(
      ErrorType.UNAUTHORIZED,
      (error as Error).message || 'Authentication failed',
      {},
      'auth_error'
    );
  }
} 