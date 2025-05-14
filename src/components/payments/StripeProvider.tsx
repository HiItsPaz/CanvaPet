'use client';

import { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

// Load Stripe outside of component render cycle (singleton pattern)
// This is the same approach used in StripePaymentService.ts
let stripePromise: ReturnType<typeof loadStripe>;
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

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
  options?: Record<string, any>;
}

export function StripeProvider({ children, clientSecret, options = {} }: StripeProviderProps) {
  // Use the singleton pattern to load Stripe only once
  const stripe = getStripe();
  
  // Default and merged options for Stripe Elements
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: 'stripe' },
    ...options,
  };

  return (
    <Elements stripe={stripe} options={elementsOptions}>
      {children}
    </Elements>
  );
} 