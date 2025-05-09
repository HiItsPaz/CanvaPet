import { supabase } from '@/lib/supabase'; // Corrected import path
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase'; // Ensure your generated types are referenced

type Order = Database['public']['Tables']['orders']['Row'];

/**
 * Fetches all orders for the currently authenticated user.
 * 
 * @param sbClient Optional Supabase client instance (useful for server-side calls)
 * @returns Promise<Order[]>
 */
export async function getUserOrders(sbClient?: SupabaseClient): Promise<Order[]> {
  const client = sbClient || supabase;
  
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError) {
    console.error("Error getting session:", sessionError);
    throw new Error('Authentication error fetching orders.');
  }
  
  if (!session) {
    // Or handle anonymous users if applicable
    throw new Error('User not authenticated.'); 
  }
  
  const userId = session.user.id;

  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    throw new Error(error.message || 'Failed to fetch orders.');
  }

  return data || [];
}

/**
 * Fetches a single order by its ID, ensuring it belongs to the current user.
 * 
 * @param orderId The ID of the order to fetch.
 * @param sbClient Optional Supabase client instance.
 * @returns Promise<Order | null>
 */
export async function getOrderByIdForUser(orderId: string, sbClient?: SupabaseClient): Promise<Order | null> {
   const client = sbClient || supabase;
  
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    console.error("Auth error fetching order:", sessionError);
    throw new Error('Authentication error.'); 
  }
  
  const userId = session.user.id;

  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error) {
      if (error.code === 'PGRST116') { // PostgREST error code for "relation does not contain row"
        console.log(`Order ${orderId} not found for user ${userId}`);
        return null;
      } else {
        console.error(`Error fetching order ${orderId}:`, error);
        throw new Error(error.message || 'Failed to fetch order details.');
      }
  }

  return data;
} 