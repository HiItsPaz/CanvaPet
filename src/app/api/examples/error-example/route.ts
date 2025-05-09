import { NextRequest, NextResponse } from 'next/server';
import { 
  withErrorHandler, 
  validationError, 
  unauthorizedError,
  notFoundError,
  ErrorType,
  createError
} from '@/lib/errorHandling';

export const runtime = 'nodejs';

/**
 * Example API route demonstrating the error handling service
 * 
 * Test with different query parameters:
 * - /api/examples/error-example?error=validation
 * - /api/examples/error-example?error=unauthorized
 * - /api/examples/error-example?error=not_found
 * - /api/examples/error-example?error=rate_limited
 * - /api/examples/error-example?error=database
 * - /api/examples/error-example?error=unhandled
 */
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    // Get error type from query string
    const url = new URL(req.url);
    const errorType = url.searchParams.get('error');
    
    // Create Supabase client
    // const supabase = createServerClient(); // Not used in this part of the switch
    
    // Get the current user from session
    // const { data: { session } } = await supabase.auth.getSession(); // session is unused
    
    // Example: Throw different types of errors based on query parameter
    switch (errorType) {
      case 'validation':
        throw validationError('Invalid parameters', { param: 'example_param' });
        
      case 'unauthorized':
        throw unauthorizedError('You must be logged in to access this resource');
        
      case 'not_found':
        throw notFoundError('Resource', '123');
        
      case 'rate_limited':
        throw createError(
          ErrorType.RATE_LIMITED,
          'Too many requests',
          {},
          'rate_limited',
          30 // retry after 30 seconds
        );
        
      case 'database':
        throw createError(
          ErrorType.DATABASE,
          'Database error occurred',
          { table: 'users', operation: 'select' },
          'db_error'
        );
        
      case 'unhandled':
        // This will be converted to a standardized error
        throw new Error('This is an unhandled error');
        
      default:
        // Return success response if no error parameter
        return NextResponse.json({ 
          message: 'Error handling example - add ?error=<type> to test different errors',
          availableErrors: [
            'validation', 
            'unauthorized', 
            'not_found', 
            'rate_limited', 
            'database',
            'unhandled'
          ]
        });
    }
  });
}

// POST example using the error handler with custom error transformer
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    try {
      const body = await req.json();
      
      // Validation example
      if (!body.name) {
        throw validationError('Name is required');
      }
      
      // Simulate successful response
      return NextResponse.json({ 
        message: 'Successfully processed request',
        data: body
      });
    } catch (error) {
      // Re-throw to let withErrorHandler handle it
      throw error;
    }
  });
} 