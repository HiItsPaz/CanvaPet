import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { withErrorHandler, unauthorizedError } from '@/lib/errorHandling';
import { safeSupabaseOperation, safeSupabaseQuery, safeSupabaseAuth } from '@/lib/supabase/errorHandling';
import { SupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Define a type-safe wrapper function for better TypeScript support
function wrapSupabaseOperation<T>(
  client: SupabaseClient,
  operation: (client: SupabaseClient) => Promise<{ data: T | null; error: any | null }>
) {
  return () => operation(client);
}

/**
 * Example API route demonstrating Supabase error handling
 * 
 * Test with different query parameters:
 * - /api/examples/supabase-error-example?operation=get_user
 * - /api/examples/supabase-error-example?operation=get_nonexistent
 * - /api/examples/supabase-error-example?operation=query_maybe_empty
 * - /api/examples/supabase-error-example?operation=auth_example
 */
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    // Get operation from query string
    const url = new URL(req.url);
    const operation = url.searchParams.get('operation');
    
    // Create Supabase client
    const supabase = createServerClient();
    
    // Get the current user from session using safe auth wrapper
    const session = await safeSupabaseAuth(() => 
      supabase.auth.getSession()
    );
    
    switch (operation) {
      case 'get_user':
        // Example using safeSupabaseOperation (expects result or throws)
        const user = await safeSupabaseOperation(
          wrapSupabaseOperation(supabase, (client) => 
            client
              .from('users')
              .select('*')
              .eq('id', session?.user?.id || '')
              .single()
          )
        );
        
        return NextResponse.json({ user });
        
      case 'get_nonexistent':
        // Example deliberately trying to get a non-existent record
        // This will throw a NOT_FOUND error
        const nonExistentUser = await safeSupabaseOperation(
          wrapSupabaseOperation(supabase, (client) => 
            client
              .from('users')
              .select('*')
              .eq('id', 'non-existent-id')
              .single()
          )
        );
        
        return NextResponse.json({ user: nonExistentUser });
        
      case 'query_maybe_empty':
        // Example using safeSupabaseQuery (allows null results)
        const maybePets = await safeSupabaseQuery(
          wrapSupabaseOperation(supabase, (client) => 
            client
              .from('pets')
              .select('*')
              .eq('user_id', session?.user?.id || '')
          )
        );
        
        // TypeScript-safe check for array length
        const petArray = Array.isArray(maybePets) ? maybePets : [];
        
        return NextResponse.json({ 
          pets: petArray,
          hasPets: petArray.length > 0 
        });
        
      case 'auth_example':
        // Example of auth error handling
        // This will show user information if logged in, or a structured auth error if not
        if (!session?.user) {
          throw unauthorizedError("You must be logged in to view this information");
        }
        return NextResponse.json({ user: session.user });
        
      default:
        // Return available operations if no operation parameter
        return NextResponse.json({ 
          message: 'Supabase error handling example - add ?operation=<type> to test',
          availableOperations: [
            'get_user', 
            'get_nonexistent', 
            'query_maybe_empty', 
            'auth_example'
          ],
          isLoggedIn: !!session?.user
        });
    }
  });
}

/**
 * Example POST request using safe Supabase operations
 */
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    // Create Supabase client
    const supabase = createServerClient();
    
    // Verify authentication
    const session = await safeSupabaseAuth(() => 
      supabase.auth.getSession()
    );

    if (!session?.user) {
      throw unauthorizedError('You must be logged in to perform this action');
    }
    
    // Parse request body
    const body = await req.json();
    
    // Example operation with potential for database errors
    // that will be standardized by our error handling
    const result = await safeSupabaseOperation(
      wrapSupabaseOperation(supabase, (client) => 
        client
          .from('example_table')
          .insert(body)
          .select()
          .single()
      )
    );
    
    return NextResponse.json({ 
      message: 'Data saved successfully',
      data: result
    });
  });
} 