import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase/server';

// For wallet payments, we'll use Stripe as the backend processor
// This route handles the confirmation after wallet payment is attempted

export async function POST(req: Request) {
  try {
    // Get current user from session
    const supabaseServer = createServerClient();
    const { data: { session } } = await supabaseServer.auth.getSession();
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - No valid session' }),
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await req.json();
    const { paymentIntentId, walletType, paymentToken } = body;
    
    if (!paymentIntentId || !walletType || !paymentToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: paymentIntentId, walletType, or paymentToken' }),
        { status: 400 }
      );
    }
    
    // Verify that this payment intent belongs to the current user
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .eq('user_id', userId)
      .single();
      
    if (orderError || !orderData) {
      return new NextResponse(
        JSON.stringify({ error: 'Order not found or not authorized' }),
        { status: 403 }
      );
    }
    
    // In a real implementation, you would process the wallet token with Stripe
    // This would involve attaching the payment method to the intent and confirming
    // For this example, we'll simulate success but log the token
    console.log(`Received ${walletType} token:`, paymentToken);
    
    // Confirm the payment intent (in a real implementation)
    // const confirmation = await stripe.paymentIntents.confirm(
    //   paymentIntentId,
    //   {
    //     payment_method_data: {
    //       type: 'card',
    //       card: { token: paymentToken }
    //     }
    //   }
    // );
    
    // Simulate a successful confirmation
    const simulatedConfirmation = {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 1000, // Would be the actual amount in a real implementation
      currency: 'usd' // Would be the actual currency in a real implementation
    };
    
    // Update order status in our database
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_method_details: {
          provider: walletType,
          token_used: true
        }
      })
      .eq('id', orderData.id);
    
    // Return the simulated confirmation
    return NextResponse.json(simulatedConfirmation);
  } catch (error: unknown) {
    console.error('Error confirming wallet payment:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Wallet payment confirmation failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500 }
    );
  }
} 