import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Initialize Stripe
const DUMMY_KEY = 'sk_test_dummy_key_for_build';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || DUMMY_KEY, {
  apiVersion: '2025-04-30.basil',
});

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
    
    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    
    // Check if the user has permission to access this payment intent
    // In a real application, you would verify that the payment intent belongs to this user
    if (paymentIntent.metadata.userId && paymentIntent.metadata.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Payment intent does not belong to this user' },
        { status: 403 }
      );
    }
    
    // Return the payment intent status
    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Error retrieving Stripe payment intent:', error);
    
    if (error.type === 'StripeInvalidRequestError' && error.statusCode === 404) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve payment intent',
        message: error.message
      },
      { status: 500 }
    );
  }
}
