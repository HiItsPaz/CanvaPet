/**
 * Supabase Error Handling
 * 
 * This module provides specialized error handling for Supabase operations
 * integrating with the main error handling service.
 */

import { PostgrestError } from '@supabase/supabase-js';
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
export async function safeSupabaseAuth<T, E = Error>(
  operation: () => Promise<{ data: { [key: string]: T }; error: E | null }>
): Promise<T> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      // Convert auth error to AppError
      const authError = error as any;
      
      if (authError.message?.includes('Email not confirmed')) {
        throw createError(
          ErrorType.UNAUTHORIZED,
          'Email not confirmed',
          {},
          'email_not_confirmed'
        );
      }
      
      if (authError.message?.includes('Invalid login credentials')) {
        throw createError(
          ErrorType.UNAUTHORIZED,
          'Invalid email or password',
          {},
          'invalid_credentials'
        );
      }
      
      throw createError(
        ErrorType.UNAUTHORIZED,
        authError.message || 'Authentication failed',
        {},
        authError.code || 'auth_error'
      );
    }
    
    const responseKey = Object.keys(data)[0];
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