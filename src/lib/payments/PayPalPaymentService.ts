import { supabase } from '@/lib/supabase';
import {
  PaymentService,
  PaymentParameters,
  PaymentIntent,
  PaymentConfirmationResult,
  RefundParameters,
  RefundResult
} from './types';

export class PayPalPaymentService implements PaymentService {
  private readonly apiBase = '/api/payments/paypal';

  async createPaymentIntent(params: PaymentParameters): Promise<PaymentIntent> {
    console.log(`[PayPalPaymentService] Creating payment intent for order ${params.orderId}`, params);
    
    const response = await fetch(`${this.apiBase}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create PayPal order');
    }
    
    const data = await response.json();
    
    // Update our database with the PayPal order
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
          payment_intent_id: data.id, // This is the PayPal order ID
          payment_provider: 'paypal'
        }, { onConflict: 'id' });
    } catch (dbError) {
      console.error('[PayPalPaymentService] DB error creating/updating order:', dbError);
    }
    
    return {
      id: data.id,
      status: data.status as 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'failed' | 'canceled',
      amount: params.amount,
      currency: params.currency,
      // For PayPal, we don't have a client secret in the same way as Stripe
      // Instead, we need to return the approval URL for the user to complete the payment
      approvalUrl: data.links.find((link: any) => link.rel === 'approve')?.href
    };
  }

  async confirmPayment(paymentIntentId: string, paymentMethodDetails?: Record<string, unknown>): Promise<PaymentConfirmationResult> {
    console.log(`[PayPalPaymentService] Confirming payment for order ${paymentIntentId}`);

    // For PayPal, this would be called after the user approves the payment and returns to our site
    // We'd capture the order using the PayPal order ID (paymentIntentId)
    
    const response = await fetch(`${this.apiBase}/capture-order/${paymentIntentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        orderId: paymentMethodDetails?.orderId as string || 'unknown',
        status: 'failed',
        message: errorData.message || 'Failed to confirm PayPal payment',
        error: { message: errorData.message || 'Failed to confirm PayPal payment' }
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
      console.error('[PayPalPaymentService] DB error fetching order:', dbError);
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
    if (data.status === 'COMPLETED') {
      try {
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            payment_method_details: {
              provider: 'paypal',
              paypal_order_id: paymentIntentId,
              paypal_payer_id: data.payer?.payer_id
            }
          })
          .eq('id', orderId);
      } catch (updateError) {
        console.error('[PayPalPaymentService] DB error updating order status:', updateError);
      }
    }
    
    return {
      success: data.status === 'COMPLETED',
      paymentIntentId,
      orderId,
      status: data.status === 'COMPLETED' ? 'succeeded' : 'failed',
      message: data.status === 'COMPLETED' ? 'Payment successful' : 'Payment failed',
      error: data.status !== 'COMPLETED' ? { message: 'Payment failed' } : undefined
    };
  }

  async processRefund(params: RefundParameters): Promise<RefundResult> {
    console.log(`[PayPalPaymentService] Processing refund for order ${params.paymentIntentId}`, params);
    
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
        message: errorData.message || 'Failed to process PayPal refund',
        error: { message: errorData.message || 'Failed to process PayPal refund' }
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
      console.error('[PayPalPaymentService] DB error fetching order for refund:', dbError);
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
        console.error('[PayPalPaymentService] DB error updating order status for refund:', updateError);
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
    console.log(`[PayPalPaymentService] Getting status for order ${paymentIntentId}`);
    
    const response = await fetch(`${this.apiBase}/check-order/${paymentIntentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get PayPal payment status');
    }
    
    const data = await response.json();
    
    // Map PayPal status to our PaymentIntent status
    let status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    
    switch (data.status) {
      case 'CREATED':
        status = 'requires_payment_method';
        break;
      case 'SAVED':
        status = 'requires_confirmation';
        break;
      case 'APPROVED':
        status = 'requires_confirmation';
        break;
      case 'VOIDED':
        status = 'canceled';
        break;
      case 'COMPLETED':
        status = 'succeeded';
        break;
      case 'PAYER_ACTION_REQUIRED':
        status = 'requires_payment_method';
        break;
      default:
        status = 'failed';
    }
    
    return {
      id: data.id,
      status,
      amount: data.purchase_units[0]?.amount?.value ? parseFloat(data.purchase_units[0].amount.value) * 100 : 0,
      currency: data.purchase_units[0]?.amount?.currency_code?.toLowerCase() || 'usd'
    };
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<void> {
    console.log('[PayPalPaymentService] Handling webhook');
    
    const event = payload as any;
    
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
      
      if (!paypalOrderId) {
        console.warn('[PayPalPaymentService] Missing PayPal order ID in webhook');
        return;
      }
      
      // Update order status in our database
      const { data: orderData, error: dbError } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', paypalOrderId)
        .single();
        
      if (dbError) {
        console.error('[PayPalPaymentService] DB error fetching order for webhook:', dbError);
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
          console.error('[PayPalPaymentService] DB error updating order status from webhook:', updateError);
        }
      }
    }
  }
} 