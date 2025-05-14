'use client';

import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Wallet, Globe } from 'lucide-react';
import { PaymentMethod, getAvailablePaymentMethods } from '@/lib/payments/PaymentServiceFactory';

type PaymentMethodOption = {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
};

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  isDisabled?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  isDisabled = false
}: PaymentMethodSelectorProps) {
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get available payment methods on component mount
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const methods = await getAvailablePaymentMethods();
        setAvailableMethods(methods);
        
        // If the currently selected method is not available, select the first available one
        if (methods.length > 0 && !methods.includes(selectedMethod)) {
          onMethodChange(methods[0]);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
        // Fallback to at least mock for development
        setAvailableMethods(['mock']);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [selectedMethod, onMethodChange]);
  
  // Define payment method options with their UI details
  const paymentOptions: Record<PaymentMethod, PaymentMethodOption> = {
    stripe: {
      id: 'stripe',
      name: 'Credit / Debit Card',
      description: 'Pay securely with your card',
      icon: <CreditCard className="h-5 w-5" />
    },
    paypal: {
      id: 'paypal',
      name: 'PayPal',
      description: 'Fast checkout with PayPal',
      icon: <Globe className="h-5 w-5" />
    },
    apple_pay: {
      id: 'apple_pay',
      name: 'Apple Pay',
      description: 'Quick and secure checkout',
      icon: <Wallet className="h-5 w-5" />
    },
    google_pay: {
      id: 'google_pay',
      name: 'Google Pay',
      description: 'Fast checkout with Google Pay',
      icon: <Wallet className="h-5 w-5" />
    },
    mock: {
      id: 'mock',
      name: 'Test Payment',
      description: 'For testing purposes only',
      icon: <CreditCard className="h-5 w-5 text-amber-500" />
    }
  };

  // Filter to only show available methods
  const methodsToShow = availableMethods
    .map(method => paymentOptions[method])
    .filter(Boolean);

  if (isLoading) {
    return <PaymentMethodSkeleton />;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Select Payment Method</h3>
      
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={value => onMethodChange(value as PaymentMethod)}
        disabled={isDisabled}
        className="space-y-2"
      >
        {methodsToShow.map((option) => (
          <div key={option.id} className="flex items-center">
            <RadioGroupItem 
              value={option.id} 
              id={`payment-${option.id}`}
              disabled={isDisabled}
              className="mr-2"
            />
            <Label 
              htmlFor={`payment-${option.id}`}
              className={`flex flex-1 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Card className={`w-full transition-all ${selectedMethod === option.id ? 'border-primary' : ''}`}>
                <CardContent className="flex items-center p-3">
                  <div className="mr-2">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {process.env.NODE_ENV !== 'production' && (
        <div className="text-xs text-amber-600 mt-2">
          <p className="font-medium">Development Mode</p>
          <p>Payments are simulated. No actual charges will be made.</p>
        </div>
      )}
    </div>
  );
}

function PaymentMethodSkeleton() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Select Payment Method</h3>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
} 