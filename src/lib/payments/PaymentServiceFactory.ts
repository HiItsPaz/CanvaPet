import { PaymentService } from './types';
import { MockPaymentService } from './MockPaymentService';

// Import the actual payment service implementations
import { StripePaymentService } from './StripePaymentService';
import { PayPalPaymentService } from './PayPalPaymentService';
import { WalletPaymentService } from './WalletPaymentService';

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

export type PaymentMethod = 'stripe' | 'paypal' | 'apple_pay' | 'google_pay' | 'mock';

export function getPaymentService(method: PaymentMethod = 'mock'): PaymentService {
  // For development and testing, we start with the mock service
  if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS) {
    console.log(`[PaymentServiceFactory] Using MockPaymentService for ${method} in dev mode`);
    return new MockPaymentService();
  }

  // In production, return the appropriate payment service
  switch (method) {
    case 'stripe':
      return new StripePaymentService();
      
    case 'paypal':
      return new PayPalPaymentService();
      
    case 'apple_pay':
    case 'google_pay':
      return new WalletPaymentService();
      
    case 'mock':
    default:
      console.log('[PaymentServiceFactory] Using MockPaymentService');
      return new MockPaymentService();
  }
}

// Helper to check if a payment method is available on the current device
export async function getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
  const available: PaymentMethod[] = ['mock'];
  
  // Always add standard methods
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    available.push('stripe');
  }
  
  if (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    available.push('paypal');
  }
  
  // Check for mobile wallets if in browser environment
  if (typeof window !== 'undefined') {
    try {
      // For Apple Pay
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        available.push('apple_pay');
      }
      
      // For Google Pay
      if (window.google?.payments?.api) {
        // We can't run the full check here without setting up the client
        // Just check if the API is available
        available.push('google_pay');
      }
    } catch (error) {
      console.error('[PaymentServiceFactory] Error checking wallet availability:', error);
    }
  }
  
  return available;
} 