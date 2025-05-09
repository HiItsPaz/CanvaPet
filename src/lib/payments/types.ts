/**
 * Payment Service Types
 * 
 * Defines common interfaces and types for payment processing.
 */

// Generic interface for payment parameters
export interface PaymentParameters {
  amount: number;          // Amount in smallest currency unit (e.g., cents)
  currency: string;        // ISO currency code (e.g., 'USD')
  description?: string;    // Optional description for the payment
  metadata?: Record<string, any>; // Additional metadata
  orderId: string;         // Internal order ID from our system
  userId: string;          // User initiating the payment
  [key: string]: any;      // Allow for provider-specific parameters
}

// Represents a payment intent or a similar concept from a payment provider
export interface PaymentIntent {
  id: string;                      // Payment intent ID from the provider
  clientSecret?: string;           // Client secret for client-side confirmation (e.g., Stripe)
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  amount: number;
  currency: string;
  [key: string]: any; 
}

// Result of a payment confirmation
export interface PaymentConfirmationResult {
  success: boolean;
  paymentIntentId?: string; // Provider's payment intent ID
  orderId: string;           // Our internal order ID
  status: 'succeeded' | 'failed' | 'pending' | 'requires_action';
  message?: string;          // User-friendly message
  error?: {
    code?: string;           // Provider-specific error code
    message: string;         // Detailed error message
  };
}

// Parameters for creating a refund
export interface RefundParameters {
  paymentIntentId: string;   // The ID of the payment to refund
  amount?: number;           // Amount to refund (optional, defaults to full amount)
  reason?: string;           // Reason for the refund
  metadata?: Record<string, any>;
}

// Result of a refund operation
export interface RefundResult {
  success: boolean;
  refundId?: string;          // Provider's refund ID
  status: 'succeeded' | 'failed' | 'pending';
  message?: string;
  error?: {
    code?: string;
    message: string;
  };
}

// Generic Payment Service Interface
export interface PaymentService {
  // Creates a payment intent or equivalent with the payment provider
  createPaymentIntent(params: PaymentParameters): Promise<PaymentIntent>;
  
  // Confirms a payment (e.g., after user enters card details)
  confirmPayment(paymentIntentId: string, paymentMethodDetails?: any): Promise<PaymentConfirmationResult>;
  
  // Processes a refund
  processRefund(params: RefundParameters): Promise<RefundResult>;
  
  // Retrieves the status of a payment
  getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent>;
  
  // Handles webhook events from the payment provider (implementation will be provider-specific)
  handleWebhook(payload: any, signature?: string): Promise<void>;
} 