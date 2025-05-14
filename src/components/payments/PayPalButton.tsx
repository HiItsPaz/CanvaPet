'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  amount: number;
  currency: string;
  onComplete: (result: {
    success: boolean;
    paymentIntentId?: string;
    error?: string;
  }) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function PayPalButton({
  amount,
  currency,
  onComplete,
  isSubmitting,
  disabled = false
}: PayPalButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // PayPal wants decimal amounts, not cents
  const paypalAmount = (amount / 100).toFixed(2);
  
  // PayPal configuration options
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: currency.toUpperCase(),
    intent: "capture",
    // Disable funding sources that you don't want
    disableFunding: "card,credit",
  };

  return (
    <div className="space-y-6">
      {(isLoading || isSubmitting) && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !isSubmitting && (
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{ 
              layout: "vertical",
              shape: "rect",
              label: "pay"
            }}
            disabled={disabled}
            forceReRender={[amount, currency]}
            fundingSource="paypal"
            createOrder={(data, actions) => {
              return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [
                  {
                    amount: {
                      value: paypalAmount,
                      currency_code: currency.toUpperCase(),
                    }
                  }
                ]
              });
            }}
            onApprove={async (data, actions) => {
              try {
                setIsLoading(true);
                setError(null);
                
                // Capture the approved payment
                if (!actions.order) {
                  throw new Error('PayPal order not available');
                }
                
                const details = await actions.order.capture();
                
                // Payment successful
                onComplete({
                  success: true,
                  paymentIntentId: details.id
                });
              } catch (err: any) {
                console.error('PayPal payment error:', err);
                setError(err.message || 'An unexpected error occurred');
                onComplete({
                  success: false,
                  error: err.message || 'PayPal payment failed'
                });
              } finally {
                setIsLoading(false);
              }
            }}
            onError={(err) => {
              console.error('PayPal error:', err);
              setError('PayPal encountered an error. Please try again.');
              onComplete({
                success: false,
                error: 'PayPal payment failed'
              });
            }}
            onCancel={() => {
              setError('Payment was cancelled. Please try again.');
              onComplete({
                success: false,
                error: 'Payment cancelled'
              });
            }}
          />
        </PayPalScriptProvider>
      )}
      
      <p className="text-xs text-center text-muted-foreground">
        By proceeding with PayPal, you'll be directed to PayPal to complete your payment securely.
      </p>
    </div>
  );
} 