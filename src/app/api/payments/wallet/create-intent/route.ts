import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// For wallet payments, we'll use Stripe as the backend processor
// In a real app, you might want to handle Apple Pay and Google Pay directly
// or use another payment processor, but Stripe offers good support for both
const DUMMY_KEY = 'sk_test_dummy_key_for_build';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || DUMMY_KEY, {
  apiVersion: '2025-04-30.basil',
});

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
    const { amount, currency, description, metadata, orderId, walletType } = body;
    
    if (!amount || !currency || !orderId) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: amount, currency, or orderId' }),
        { status: 400 }
      );
    }
    
    // Create a payment intent with Stripe (as the backend processor for wallet payments)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: description || `Order ${orderId}`,
      metadata: {
        orderId,
        userId,
        walletType,
        ...(metadata || {}),
      },
      payment_method_types: ['card'],
      // If using Apple Pay specifically:
      ...(walletType === 'apple_pay' ? { payment_method_options: { card: { setup_future_usage: 'off_session' } } } : {}),
    });
    
    // Update our database with the payment intent
    try {
      await supabase
        .from('orders')
        .upsert({
          id: orderId,
          user_id: userId,
          amount,
          currency,
          status: 'pending_payment',
          metadata: {
            ...metadata,
            walletType
          },
          payment_intent_id: paymentIntent.id,
          payment_provider: walletType || 'wallet'
        }, { onConflict: 'id' });
    } catch (dbError) {
      console.error('[Wallet Payment] DB error creating/updating order:', dbError);
    }
    
    // Return the client secret and payment intent ID
    return NextResponse.json({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error: unknown) {
    console.error('Error creating wallet payment intent:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Wallet payment intent creation failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500 }
    );
  }
} 