import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request, context) {
  try {
    // Get the payment intent ID from the route parameters
    const id = context.params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }
    
    // Verify user has access to this payment intent
    const supabaseServer = createServerClient();
    const { data: { session } } = await supabaseServer.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }
    
    // Check if this payment intent exists in our database
    const { data: paymentData, error: paymentError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('payment_intent_id', id)
      .single();
    
    if (paymentError || !paymentData) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has permission to access this payment intent
    if (paymentData.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Payment intent does not belong to this user' },
        { status: 403 }
      );
    }
    
    // Return the payment status
    return NextResponse.json({
      id: paymentData.payment_intent_id,
      status: paymentData.status,
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd'
    });
  } catch (error) {
    console.error('Error retrieving wallet payment intent:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve payment intent',
        message: error.message
      },
      { status: 500 }
    );
  }
}
