'use client';

import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface StripeCardFormProps {
  clientSecret: string;
  onComplete: (result: {
    success: boolean;
    paymentIntentId?: string;
    error?: string;
  }) => void;
  isSubmitting: boolean;
  amount: number;
  currency: string;
  disabled?: boolean;
}

export function StripeCardForm({
  clientSecret,
  onComplete,
  isSubmitting,
  amount,
  currency,
  disabled = false
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  
  // Format currency for display
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  }).format(amount / 100);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }
    
    if (isSubmitting || processing) {
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Card element not found. Please refresh the page and try again.');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });
      
      if (error) {
        setError(error.message || 'An error occurred while processing your payment.');
        onComplete({
          success: false,
          error: error.message || 'Payment failed'
        });
      } else if (paymentIntent) {
        // Payment successful
        onComplete({
          success: true,
          paymentIntentId: paymentIntent.id
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      onComplete({
        success: false,
        error: err.message || 'An unexpected error occurred'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle changes to the card element
  const handleCardChange = (event: any) => {
    setError(event.error ? event.error.message : '');
    setCardComplete(event.complete);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-md border p-6">
          <div className="mb-4">
            <h3 className="font-medium text-base">Card Details</h3>
            <p className="text-sm text-muted-foreground">
              Enter your credit or debit card information to complete the payment of {formattedAmount}
            </p>
          </div>
          
          <div className="border rounded-md p-3 bg-background">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
                hidePostalCode: true,
              }}
              onChange={handleCardChange}
            />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !cardComplete || processing || disabled || isSubmitting}
      >
        {(processing || isSubmitting) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formattedAmount}`
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured by Stripe. We do not store your card details.
      </p>
    </form>
  );
} 