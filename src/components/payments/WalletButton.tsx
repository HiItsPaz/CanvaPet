'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard } from 'lucide-react';
import { WalletPaymentService } from '@/lib/payments/WalletPaymentService';

interface WalletButtonProps {
  amount: number;
  currency: string;
  onComplete: (result: {
    success: boolean;
    paymentIntentId?: string;
    error?: string;
    walletType?: 'apple_pay' | 'google_pay';
    paymentToken?: string;
  }) => void;
  isSubmitting: boolean;
  walletType: 'apple_pay' | 'google_pay';
  disabled?: boolean;
}

export function WalletButton({
  amount,
  currency,
  onComplete,
  isSubmitting,
  walletType,
  disabled = false
}: WalletButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if the wallet type is supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        setIsLoading(true);
        const support = await WalletPaymentService.isSupported();
        setIsSupported(
          walletType === 'apple_pay' ? support.applePay : support.googlePay
        );
      } catch (err) {
        console.error(`${walletType} support check error:`, err);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSupport();
  }, [walletType]);

  // Handle wallet payment
  const handleWalletPayment = async () => {
    if (disabled || isSubmitting || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Implement the wallet-specific payment flow
      // This is a simplified example - actual implementation would
      // interact with the specific wallet's APIs
      
      if (walletType === 'apple_pay') {
        // Apple Pay implementation
        // In a real implementation, you would use the ApplePay JS API
        if (!window.ApplePaySession) {
          throw new Error('Apple Pay is not supported in this browser');
        }

        // Simplified for the example - in a real app you would create
        // a payment request and handle the session
        setTimeout(() => {
          // Simulate success after a delay
          onComplete({
            success: true,
            paymentIntentId: `ap-${Date.now()}`,
            walletType: 'apple_pay',
            paymentToken: 'simulated-apple-pay-token'
          });
          setIsLoading(false);
        }, 1500);
      } else {
        // Google Pay implementation
        // In a real implementation, you would use the Google Pay JS API
        if (!window.google?.payments?.api) {
          throw new Error('Google Pay is not supported in this browser');
        }

        // Simplified for the example
        setTimeout(() => {
          // Simulate success after a delay
          onComplete({
            success: true,
            paymentIntentId: `gp-${Date.now()}`,
            walletType: 'google_pay',
            paymentToken: 'simulated-google-pay-token'
          });
          setIsLoading(false);
        }, 1500);
      }
    } catch (err: any) {
      console.error(`${walletType} payment error:`, err);
      setError(err.message || 'An unexpected error occurred');
      onComplete({
        success: false,
        error: err.message || `${walletType} payment failed`,
        walletType
      });
      setIsLoading(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            {walletType === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} is not supported on this device or browser.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleWalletPayment}
        disabled={disabled || !isSupported}
        className="w-full flex items-center justify-center"
        variant="outline"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Pay with {walletType === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Pay securely using {walletType === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}.
      </p>
    </div>
  );
} 