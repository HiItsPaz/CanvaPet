import { supabase } from '@/lib/supabase';
import {
  PaymentService,
  PaymentParameters,
  PaymentIntent,
  PaymentConfirmationResult,
  RefundParameters,
  RefundResult
} from './types';

// Simulate a short delay for API calls
const MOCK_API_DELAY_MS = 1500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for mock payment intents (replace with database in real scenario if needed outside provider)
const mockPaymentIntents: Record<string, PaymentIntent & { orderId: string, userId: string }> = {};

interface MockPaymentMethodDetailsCard {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  name: string;
}

interface MockPaymentMethodDetails {
  card?: MockPaymentMethodDetailsCard;
  billing_details?: { name?: string };
  // Add other potential payment method structures if needed
}

interface MockWebhookPayloadData {
  object?: PaymentIntent; // Assuming the webhook object is a PaymentIntent
  // Add other potential properties of the data object
}

interface MockWebhookPayload {
  type: string;
  data?: MockWebhookPayloadData;
  // Add other top-level webhook payload properties if needed
}

export class MockPaymentService implements PaymentService {
  async createPaymentIntent(params: PaymentParameters): Promise<PaymentIntent> {
    await delay(MOCK_API_DELAY_MS);
    console.log(`[MockPaymentService] Creating payment intent for order ${params.orderId}`, params);

    const paymentIntentId = `mock_pi_${Date.now()}_${params.orderId}`;
    const paymentIntent: PaymentIntent & { orderId: string, userId: string } = {
      id: paymentIntentId,
      clientSecret: `mock_cs_${paymentIntentId}`,
      status: 'requires_payment_method',
      amount: params.amount,
      currency: params.currency,
      orderId: params.orderId,
      userId: params.userId,
      metadata: params.metadata || {},
      created: Math.floor(Date.now() / 1000),
    };

    mockPaymentIntents[paymentIntentId] = paymentIntent;
    
    // Simulate creating/updating an order record in our database with 'pending_payment' status
    try {
      await supabase
        .from('orders') 
        .upsert({
          id: params.orderId,
          user_id: params.userId,
          amount: params.amount,
          currency: params.currency,
          status: 'pending_payment', // Or a more specific status like 'requires_payment_method'
          metadata: params.metadata,
          payment_intent_id: paymentIntentId 
        }, { onConflict: 'id' });
    } catch (dbError) {
      console.error('[MockPaymentService] DB error creating/updating order:', dbError);
      // Handle error, maybe throw if critical
    }

    console.log(`[MockPaymentService] Created payment intent: ${paymentIntentId}`);
    return paymentIntent;
  }

  async confirmPayment(paymentIntentId: string, paymentMethodDetails?: MockPaymentMethodDetails): Promise<PaymentConfirmationResult> {
    await delay(MOCK_API_DELAY_MS);
    console.log(`[MockPaymentService] Confirming payment for intent ${paymentIntentId}`, paymentMethodDetails);

    const intent = mockPaymentIntents[paymentIntentId];
    if (!intent) {
      return {
        success: false,
        orderId: 'unknown',
        status: 'failed',
        message: 'Payment intent not found.',
        error: { code: 'intent_not_found', message: 'Payment intent not found.' },
      };
    }

    // Simulate payment success/failure based on mock card details or other logic
    // Example: Use a specific mock card number from paymentMethodDetails to simulate failure
    const cardNumber = paymentMethodDetails?.card?.number as string || '';
    let paymentSuccessful = true;
    let errorMessage = 'Payment processed successfully.';
    let errorCode = undefined;

    if (cardNumber.endsWith('0002')) { // Simulate a declined card
      paymentSuccessful = false;
      errorMessage = 'Your card was declined.';
      errorCode = 'card_declined';
      intent.status = 'failed';
    } else if (cardNumber.endsWith('0003')) { // Simulate insufficient funds
      paymentSuccessful = false;
      errorMessage = 'Insufficient funds.';
      errorCode = 'insufficient_funds';
      intent.status = 'failed';
    } else {
      intent.status = 'succeeded';
    }

    // Update order status in the database
    try {
      await supabase
        .from('orders')
        .update({
          status: paymentSuccessful ? 'completed' : 'payment_failed',
          payment_method_details: paymentMethodDetails // Store mock payment details if needed
        })
        .eq('id', intent.orderId);
        
      if (paymentSuccessful) {
        // Potentially update related records, like marking portraits as purchased
         await supabase
          .from('portraits') 
          .update({ is_purchased: true })
          .in('id', ((intent.metadata || {}) as any).portraitIds || []); 
      }

    } catch (dbError) {
      console.error('[MockPaymentService] DB error updating order status:', dbError);
      // This is a critical error, as payment might have succeeded but order status failed to update
      // Consider how to handle this (e.g., background reconciliation job)
      return {
        success: false,
        orderId: intent.orderId,
        paymentIntentId: intent.id,
        status: 'failed',
        message: 'Database error after payment processing.',
        error: { code: 'db_error_after_payment', message: (dbError as Error).message },
      };
    }

    console.log(`[MockPaymentService] Payment confirmation for ${paymentIntentId}: ${paymentSuccessful ? 'Success' : 'Failed'}`);
    return {
      success: paymentSuccessful,
      paymentIntentId: intent.id,
      orderId: intent.orderId,
      status: intent.status,
      message: errorMessage,
      error: errorCode ? { code: errorCode, message: errorMessage } : undefined,
    };
  }

  async processRefund(params: RefundParameters): Promise<RefundResult> {
    await delay(MOCK_API_DELAY_MS);
    console.log(`[MockPaymentService] Processing refund for payment intent ${params.paymentIntentId}`, params);

    const intent = mockPaymentIntents[params.paymentIntentId];
    if (!intent || intent.status !== 'succeeded') {
      return {
        success: false,
        status: 'failed',
        message: 'Payment not found or not in a refundable state.',
        error: { code: 'refund_error', message: 'Payment not found or not in a refundable state.' },
      };
    }

    // Simulate refund success
    const refundId = `mock_re_${Date.now()}`;
    intent.status = 'requires_confirmation'; // Or some 'refunded' status if your model supports it

    // Update order status in the database to 'refunded' or similar
    try {
      await supabase
        .from('orders')
        .update({
          status: 'refunded', 
          // Add refund details if needed
        })
        .eq('id', intent.orderId);
    } catch (dbError) {
      console.error('[MockPaymentService] DB error updating order for refund:', dbError);
      return {
        success: false,
        status: 'failed',
        message: 'Database error processing refund.',
        error: { code: 'db_error_refund', message: (dbError as Error).message },
      };
    }

    console.log(`[MockPaymentService] Refund processed: ${refundId}`);
    return {
      success: true,
      refundId: refundId,
      status: 'succeeded',
      message: 'Refund processed successfully.',
    };
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    await delay(MOCK_API_DELAY_MS / 2); // Faster for status checks
    console.log(`[MockPaymentService] Getting status for payment intent ${paymentIntentId}`);
    
    const intent = mockPaymentIntents[paymentIntentId];
    if (!intent) {
      throw new Error('Payment intent not found in mock service.');
    }
    return intent;
  }

  async handleWebhook(payload: Record<string, unknown>, signature?: string): Promise<void> {
    await delay(MOCK_API_DELAY_MS / 2);
    console.log('[MockPaymentService] Received mock webhook:', payload, signature ? `Signature: ${signature}` : 'No signature');
    
    // Type assertion to use our expected format while maintaining interface compatibility
    const typedPayload = payload as unknown as MockWebhookPayload;
    const eventType = typedPayload.type;
    const paymentIntent = typedPayload.data?.object as PaymentIntent;

    if (!paymentIntent || !paymentIntent.id) {
        console.warn('[MockPaymentService] Webhook received without valid payment intent data.');
        return;
    }

    const internalIntent = mockPaymentIntents[paymentIntent.id];
     if (!internalIntent) {
        console.warn(`[MockPaymentService] Webhook for unknown intent ID: ${paymentIntent.id}`);
        return;
    }

    if (eventType === 'payment_intent.succeeded') {
      console.log(`[MockPaymentService] Webhook: Payment succeeded for ${paymentIntent.id}, order ${internalIntent.orderId}`);
      try {
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', internalIntent.orderId);

        await supabase
          .from('portraits') 
          .update({ is_purchased: true })
          .in('id', ((internalIntent.metadata || {}) as any).portraitIds || []); 

        mockPaymentIntents[paymentIntent.id].status = 'succeeded';
      } catch (dbError) {
        console.error('[MockPaymentService] Webhook DB error updating order:', dbError);
      }
    } else if (eventType === 'payment_intent.payment_failed') {
      console.log(`[MockPaymentService] Webhook: Payment failed for ${paymentIntent.id}, order ${internalIntent.orderId}`);
      try {
         await supabase
          .from('orders')
          .update({ status: 'payment_failed' })
          .eq('id', internalIntent.orderId);
        mockPaymentIntents[paymentIntent.id].status = 'failed';
      } catch (dbError) {
        console.error('[MockPaymentService] Webhook DB error updating order (failed payment):', dbError);
      }
    } else {
      console.log(`[MockPaymentService] Webhook: Received unhandled event type ${eventType}`);
    }
  }
}

// Factory function to get the payment service (easily swappable)
// For now, it always returns the mock service.
// In the future, this could check an environment variable or config to return a real service.
let paymentServiceInstance: PaymentService | null = null;

export function getPaymentService(): PaymentService {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new MockPaymentService();
  }
  return paymentServiceInstance;
} 