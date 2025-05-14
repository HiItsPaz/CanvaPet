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

export async function POST(req: Request) {
  try {
    // Get current user from session
    // const cookieStore = cookies(); // Removed unused variable
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
    
    // PayPal wants decimal amounts, not cents
    const paypalAmount = (amount / 100).toFixed(2);
    
    // Get access token
    const accessToken = await getPayPalAccessToken();
    
    // Create PayPal order
    const paypalResponse = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            description: description || `Order ${orderId}`,
            amount: {
              currency_code: currency.toUpperCase(),
              value: paypalAmount
            },
            custom_id: userId
          }
        ],
        application_context: {
          brand_name: 'CanvaPet',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`
        }
      })
    });
    
    if (!paypalResponse.ok) {
      const errorData = await paypalResponse.json();
      console.error('PayPal API error:', errorData);
      return new NextResponse(
        JSON.stringify({
          error: 'PayPal order creation failed',
          message: errorData.details?.[0]?.issue || 'Unknown error'
        }),
        { status: 500 }
      );
    }
    
    const paypalData = await paypalResponse.json();
    
    // Store the order details in the database
    await supabase
      .from('orders')
      .upsert({
        id: orderId,
        user_id: userId,
        amount,
        currency,
        status: 'pending_payment',
        metadata: metadata || {},
        payment_intent_id: paypalData.id,
        payment_provider: 'paypal'
      }, { onConflict: 'id' });
    
    // Return the PayPal order ID and approval URL
    return NextResponse.json({
      id: paypalData.id,
      status: paypalData.status === 'CREATED' ? 'requires_payment_method' : paypalData.status,
      links: paypalData.links
    });
  } catch (error: unknown) {
    console.error('Error creating PayPal order:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'PayPal order creation failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { status: 500 }
    );
  }
} 