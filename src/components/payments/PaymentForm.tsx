'use client';

import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/lib/payments/PaymentServiceFactory';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { StripeProvider } from './StripeProvider';
import { StripeCardForm } from './StripeCardForm';
import { PayPalButton } from './PayPalButton';
import { WalletButton } from './WalletButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPaymentService } from '@/lib/payments/PaymentServiceFactory';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  currency?: string;
  onPaymentComplete: (result: {
    success: boolean;
    paymentIntentId?: string;
    error?: string;
  }) => void;
}

export function PaymentForm({
  orderId,
  amount,
  currency = 'usd',
  onPaymentComplete
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Initialize payment intent when payment method changes
  useEffect(() => {
    // Only create a payment intent if we have a valid orderId and amount
    if (!orderId || amount <= 0) return;
    
    const initializePayment = async () => {
      setIsInitializing(true);
      setError(null);
      setClientSecret(null);
      
      try {
        // Get the appropriate payment service for the selected method
        const paymentService = getPaymentService(selectedMethod);
        
        // Create a payment intent
        const result = await paymentService.createPaymentIntent({
          orderId,
          amount,
          currency,
          metadata: { paymentMethod: selectedMethod },
          userId: 'current-user', // This would be the actual user ID in a real app
          walletType: selectedMethod === 'apple_pay' || selectedMethod === 'google_pay' 
            ? selectedMethod 
            : undefined
        });
        
        // Store the client secret for Stripe or the payment intent ID for other methods
        setClientSecret(result.clientSecret || null);
        
        if (!result.clientSecret && selectedMethod === 'stripe') {
          throw new Error('No client secret received from Stripe');
        }
      } catch (err: any) {
        console.error('Payment initialization error:', err);
        setError(err.message || 'Failed to initialize payment. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializePayment();
  }, [orderId, amount, currency, selectedMethod]);

  // Handle payment completion
  const handlePaymentComplete = (result: {
    success: boolean;
    paymentIntentId?: string;
    error?: string;
    walletType?: 'apple_pay' | 'google_pay';
    paymentToken?: string;
  }) => {
    setIsSubmitting(false);
    
    // Pass the result to the parent component
    onPaymentComplete({
      success: result.success,
      paymentIntentId: result.paymentIntentId,
      error: result.error
    });
  };

  // Render the appropriate payment form based on the selected method
  const renderPaymentForm = () => {
    if (isInitializing) {
      return (
        <div className="p-8 flex justify-center">
          <span className="animate-pulse">Initializing payment...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    switch (selectedMethod) {
      case 'stripe':
        return clientSecret ? (
          <StripeProvider clientSecret={clientSecret}>
            <StripeCardForm
              clientSecret={clientSecret}
              onComplete={handlePaymentComplete}
              isSubmitting={isSubmitting}
              amount={amount}
              currency={currency}
              disabled={isSubmitting}
            />
          </StripeProvider>
        ) : null;
        
      case 'paypal':
        return (
          <PayPalButton
            amount={amount}
            currency={currency}
            onComplete={handlePaymentComplete}
            isSubmitting={isSubmitting}
            disabled={isSubmitting}
          />
        );
        
      case 'apple_pay':
      case 'google_pay':
        return (
          <WalletButton
            amount={amount}
            currency={currency}
            onComplete={handlePaymentComplete}
            isSubmitting={isSubmitting}
            walletType={selectedMethod}
            disabled={isSubmitting}
          />
        );
        
      case 'mock':
      default:
        // Simple mock payment for testing
        return (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                This is a test payment. No actual charge will be made.
              </AlertDescription>
            </Alert>
            <button
              onClick={() => {
                setIsSubmitting(true);
                // Simulate payment process
                setTimeout(() => {
                  handlePaymentComplete({
                    success: true,
                    paymentIntentId: `mock-${Date.now()}`
                  });
                }, 1500);
              }}
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : `Pay ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency.toUpperCase()
              }).format(amount / 100)}`}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
        isDisabled={isSubmitting}
      />
      
      <div className="mt-6">
        {renderPaymentForm()}
      </div>
    </div>
  );
} 