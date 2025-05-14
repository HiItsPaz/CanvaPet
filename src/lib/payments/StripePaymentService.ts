import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';
import {
  PaymentService,
  PaymentParameters,
  PaymentIntent,
  PaymentConfirmationResult,
  RefundParameters,
  RefundResult
} from './types';

// Load the Stripe client once (singleton pattern)
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Stripe publishable key is missing');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export class StripePaymentService implements PaymentService {
  private readonly apiBase = '/api/payments/stripe';
  
  async createPaymentIntent(params: PaymentParameters): Promise<PaymentIntent> {
    console.log(`[StripePaymentService] Creating payment intent for order ${params.orderId}`, params);
    
    const response = await fetch(`${this.apiBase}/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment intent');
    }
    
    const data = await response.json();
    
    // Update our database with the payment intent
    try {
      await supabase
        .from('orders')
        .upsert({
          id: params.orderId,
          user_id: params.userId,
          amount: params.amount,
          currency: params.currency,
          status: 'pending_payment',
          metadata: params.metadata,
          payment_intent_id: data.id,
          payment_provider: 'stripe'
        }, { onConflict: 'id' });
    } catch (dbError) {
      console.error('[StripePaymentService] DB error creating/updating order:', dbError);
      // Consider whether to throw here or just log the error
    }
    
    return {
      id: data.id,
      clientSecret: data.client_secret,
      status: data.status,
      amount: data.amount,
      currency: data.currency
    };
  }
  
  async confirmPayment(paymentIntentId: string, paymentMethodDetails?: Record<string, unknown>): Promise<PaymentConfirmationResult> {
    console.log(`[StripePaymentService] Confirming payment for intent ${paymentIntentId}`);
    
    // This would typically be handled by Stripe.js on the client
    // Here we're just checking the status of the payment intent
    
    const response = await fetch(`${this.apiBase}/check-intent/${paymentIntentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        orderId: paymentMethodDetails?.orderId as string || 'unknown',
        status: 'failed',
        message: errorData.message || 'Failed to confirm payment',
        error: { message: errorData.message || 'Failed to confirm payment' }
      };
    }
    
    const data = await response.json();
    
    // Get the order ID from our database
    const { data: orderData, error: dbError } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .single();
      
    if (dbError) {
      console.error('[StripePaymentService] DB error fetching order:', dbError);
      return {
        success: false,
        orderId: 'unknown',
        paymentIntentId,
        status: 'failed',
        message: 'Database error after payment processing',
        error: { message: 'Database error after payment processing' }
      };
    }
    
    const orderId = orderData?.id || 'unknown';
    
    // Update order status in the database
    if (data.status === 'succeeded') {
      try {
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            payment_method_details: paymentMethodDetails
          })
          .eq('id', orderId);
      } catch (updateError) {
        console.error('[StripePaymentService] DB error updating order status:', updateError);
      }
    }
    
    return {
      success: data.status === 'succeeded',
      paymentIntentId,
      orderId,
      status: data.status === 'succeeded' ? 'succeeded' : 'failed',
      message: data.status === 'succeeded' ? 'Payment successful' : 'Payment failed',
      error: data.status !== 'succeeded' ? { message: 'Payment failed' } : undefined
    };
  }
  
  async processRefund(params: RefundParameters): Promise<RefundResult> {
    console.log(`[StripePaymentService] Processing refund for payment intent ${params.paymentIntentId}`, params);
    
    const response = await fetch(`${this.apiBase}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        status: 'failed',
        message: errorData.message || 'Failed to process refund',
        error: { message: errorData.message || 'Failed to process refund' }
      };
    }
    
    const data = await response.json();
    
    // Get the order ID from our database
    const { data: orderData, error: dbError } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', params.paymentIntentId)
      .single();
      
    if (dbError) {
      console.error('[StripePaymentService] DB error fetching order for refund:', dbError);
    } else if (orderData?.id) {
      // Update order status in the database
      try {
        await supabase
          .from('orders')
          .update({
            status: 'refunded'
          })
          .eq('id', orderData.id);
      } catch (updateError) {
        console.error('[StripePaymentService] DB error updating order status for refund:', updateError);
      }
    }
    
    return {
      success: true,
      refundId: data.id,
      status: 'succeeded',
      message: 'Refund processed successfully',
    };
  }
  
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    console.log(`[StripePaymentService] Getting status for payment intent ${paymentIntentId}`);
    
    const response = await fetch(`${this.apiBase}/check-intent/${paymentIntentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get payment status');
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency
    };
  }
  
  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<void> {
    console.log('[StripePaymentService] Handling webhook');
    
    // This would be implemented in an API route that receives webhook events from Stripe
    // Here we would verify the signature, parse the event, and update our database accordingly
    
    if (!signature) {
      console.warn('[StripePaymentService] Missing webhook signature');
      return;
    }
    
    const event = payload as any;
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Update order status in our database
      const { data: orderData, error: dbError } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', paymentIntent.id)
        .single();
        
      if (dbError) {
        console.error('[StripePaymentService] DB error fetching order for webhook:', dbError);
        return;
      }
      
      if (orderData?.id) {
        try {
          await supabase
            .from('orders')
            .update({
              status: 'completed'
            })
            .eq('id', orderData.id);
        } catch (updateError) {
          console.error('[StripePaymentService] DB error updating order status from webhook:', updateError);
        }
      }
    }
  }
} 