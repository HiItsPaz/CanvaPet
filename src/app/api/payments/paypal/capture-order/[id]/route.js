import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase/server';

// PayPal API base URLs
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Function to get PayPal access token
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are missing');
  }
  
  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal authentication failed: ${error.error_description}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

export async function POST(request, context) {
  try {
    // Get PayPal order ID from route parameter
    const paypalOrderId = context.params.id;
    
    if (!paypalOrderId) {
      return NextResponse.json(
        { error: 'PayPal order ID is required' },
        { status: 400 }
      );
    }
    
    // Get current user from session
    const supabaseServer = createServerClient();
    const { data: { session } } = await supabaseServer.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Verify that this order belongs to the current user
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paypalOrderId)
      .eq('user_id', userId)
      .single();
      
    if (orderError || !orderData) {
      return NextResponse.json(
        { error: 'Order not found or not authorized' },
        { status: 403 }
      );
    }
    
    // Get access token
    const accessToken = await getPayPalAccessToken();
    
    // Capture the payment
    const captureResponse = await fetch(`${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!captureResponse.ok) {
      // Handle capture errors
      const errorData = await captureResponse.json();
      console.error('PayPal capture error:', errorData);
      
      // Update order status in our database
      await supabase
        .from('orders')
        .update({
          status: 'payment_failed',
          payment_error: JSON.stringify(errorData)
        })
        .eq('id', orderData.id);
        
      return NextResponse.json(
        {
          error: 'PayPal payment capture failed',
          message: errorData.details?.[0]?.issue || 'Unknown error'
        },
        { status: 400 }
      );
    }
    
    const captureData = await captureResponse.json();
    
    // Update order status in our database to completed
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_details: captureData
      })
      .eq('id', orderData.id);
    
    // Return success response with capture details
    return NextResponse.json({
      id: captureData.id,
      status: captureData.status,
      payer: captureData.payer
    });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json(
      {
        error: 'PayPal payment capture failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}
