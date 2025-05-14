import { supabase } from '@/lib/supabase';
import {
  PaymentService,
  PaymentParameters,
  PaymentIntent,
  PaymentConfirmationResult,
  RefundParameters,
  RefundResult
} from './types';

// Add type definitions for browser payment APIs
declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments: () => boolean;
    };
    google?: {
      payments?: {
        api?: {
          PaymentsClient: any;
        };
      };
    };
  }
}

// This service handles both Apple Pay and Google Pay
// The actual implementation would depend on the payment processor being used
// This is often integrated with Stripe, but could also be a direct integration
export class WalletPaymentService implements PaymentService {
  private readonly apiBase = '/api/payments/wallet';
  
  // Helper to determine if the device supports Apple Pay or Google Pay
  static async isSupported(): Promise<{ applePay: boolean; googlePay: boolean }> {
    // Apple Pay detection
    const applePaySupported = !!window.ApplePaySession && !!window.ApplePaySession.canMakePayments();
    
    // Google Pay detection
    let googlePaySupported = false;
    
    if (window.google?.payments?.api?.PaymentsClient) {
      try {
        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
        });
        
        const isReadyToPayRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
            }
          }]
        };
        
        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
        googlePaySupported = response.result;
      } catch (error) {
        console.error('Google Pay check failed:', error);
        googlePaySupported = false;
      }
    }
    
    return { applePay: applePaySupported, googlePay: googlePaySupported };
  }
  
  async createPaymentIntent(params: PaymentParameters): Promise<PaymentIntent> {
    console.log(`[WalletPaymentService] Creating payment intent for order ${params.orderId}`, params);
    
    const response = await fetch(`${this.apiBase}/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create wallet payment intent');
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
          payment_provider: params.walletType || 'wallet' // 'apple_pay' or 'google_pay'
        }, { onConflict: 'id' });
    } catch (dbError) {
      console.error('[WalletPaymentService] DB error creating/updating order:', dbError);
    }
    
    return {
      id: data.id,
      clientSecret: data.client_secret,
      status: data.status,
      amount: params.amount,
      currency: params.currency
    };
  }
  
  async confirmPayment(paymentIntentId: string, paymentMethodDetails?: Record<string, unknown>): Promise<PaymentConfirmationResult> {
    console.log(`[WalletPaymentService] Confirming payment for intent ${paymentIntentId}`);
    
    // For Apple Pay / Google Pay, the confirmation typically happens on the client side
    // through the wallet's UI, and then we just need to check the result
    
    const walletType = paymentMethodDetails?.walletType as string;
    const paymentToken = paymentMethodDetails?.paymentToken;
    
    if (!paymentToken) {
      return {
        success: false,
        orderId: paymentMethodDetails?.orderId as string || 'unknown',
        status: 'failed',
        message: 'Missing payment token',
        error: { message: 'Missing payment token' }
      };
    }
    
    const response = await fetch(`${this.apiBase}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        walletType,
        paymentToken
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        orderId: paymentMethodDetails?.orderId as string || 'unknown',
        status: 'failed',
        message: errorData.message || 'Failed to confirm wallet payment',
        error: { message: errorData.message || 'Failed to confirm wallet payment' }
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
      console.error('[WalletPaymentService] DB error fetching order:', dbError);
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
            payment_method_details: {
              provider: walletType || 'wallet',
              token_used: true
            }
          })
          .eq('id', orderId);
      } catch (updateError) {
        console.error('[WalletPaymentService] DB error updating order status:', updateError);
      }
    }
    
    return {
      success: data.status === 'succeeded',
      paymentIntentId,
      orderId,
      status: data.status,
      message: data.status === 'succeeded' ? 'Payment successful' : 'Payment failed',
      error: data.status !== 'succeeded' ? { message: 'Payment failed' } : undefined
    };
  }
  
  async processRefund(params: RefundParameters): Promise<RefundResult> {
    console.log(`[WalletPaymentService] Processing refund for payment intent ${params.paymentIntentId}`, params);
    
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
        message: errorData.message || 'Failed to process wallet refund',
        error: { message: errorData.message || 'Failed to process wallet refund' }
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
      console.error('[WalletPaymentService] DB error fetching order for refund:', dbError);
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
        console.error('[WalletPaymentService] DB error updating order status for refund:', updateError);
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
    console.log(`[WalletPaymentService] Getting status for payment intent ${paymentIntentId}`);
    
    const response = await fetch(`${this.apiBase}/check-intent/${paymentIntentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get wallet payment status');
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
    console.log('[WalletPaymentService] Handling webhook');
    
    // The webhook handling would depend on the underlying payment processor
    // For example, if using Stripe for Apple Pay / Google Pay, we'd use Stripe's webhook handling
    
    if (!signature) {
      console.warn('[WalletPaymentService] Missing webhook signature');
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
        console.error('[WalletPaymentService] DB error fetching order for webhook:', dbError);
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
          console.error('[WalletPaymentService] DB error updating order status from webhook:', updateError);
        }
      }
    }
  }
} 