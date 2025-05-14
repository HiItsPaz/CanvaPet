import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Initialize Stripe
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
    const { amount, currency, description, metadata, orderId } = body;
    
    if (!amount || !currency || !orderId) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: amount, currency, or orderId' }),
        { status: 400 }
      );
    }
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      description: description || `Order ${orderId}`,
      metadata: {
        orderId,
        userId,
        ...(metadata || {}),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Return the client secret and payment intent ID to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error: unknown) {
    console.error('Error creating Stripe payment intent:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Payment intent creation failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500 }
    );
  }
} 