import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { withErrorHandler, unauthorizedError } from '@/lib/errorHandling';
import { safeSupabaseOperation, safeSupabaseQuery, safeSupabaseAuth } from '@/lib/supabase/errorHandling';

export const runtime = 'nodejs';

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
    const url = new URL(req.url);
    const operation = url.searchParams.get('operation');
    const supabase = createServerClient();
    
    const session = await safeSupabaseAuth(() => supabase.auth.getSession());
    
    switch (operation) {
      case 'get_user':
        const user = await safeSupabaseOperation(async () => 
          supabase
            .from('users')
            .select('*')
            .eq('id', session?.user?.id || '')
            .single()
        );
        return NextResponse.json({ user });
        
      case 'get_nonexistent':
        const nonExistentUser = await safeSupabaseOperation(async () => 
          supabase
            .from('users')
            .select('*')
            .eq('id', 'non-existent-id')
            .single()
        );
        return NextResponse.json({ user: nonExistentUser });
        
      case 'query_maybe_empty':
        const maybePets = await safeSupabaseQuery(async () => 
          supabase
            .from('pets')
            .select('*')
            .eq('user_id', session?.user?.id || '')
        );
        
        const petArray = Array.isArray(maybePets) ? maybePets : [];
        return NextResponse.json({ pets: petArray, hasPets: petArray.length > 0 });
        
      case 'auth_example':
        if (!session?.user) {
          throw unauthorizedError("You must be logged in to view this information");
        }
        return NextResponse.json({ user: session.user });
        
      default:
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
    const supabase = createServerClient();
    const session = await safeSupabaseAuth(() => supabase.auth.getSession());
    if (!session?.user) {
      throw unauthorizedError('You must be logged in to perform this action');
    }
    const body = await req.json() as Record<string, unknown>;
    const result = await safeSupabaseOperation(async () => 
      supabase
        .from('example_table')
        .insert(body)
        .select()
        .single()
    );
    return NextResponse.json({ message: 'Data saved successfully', data: result });
  });
} 