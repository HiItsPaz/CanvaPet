import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPaymentService } from '@/lib/payments/MockPaymentService'; // Will use factory
import { PaymentParameters, PaymentIntent, PaymentConfirmationResult } from '@/lib/payments/types';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface MockCheckoutFormProps {
  orderId: string;
  userId: string;
  amount: number; // Amount in smallest currency unit (e.g., cents)
  currency: string; // e.g., USD
  portraitIds: string[]; // To mark as purchased
  onSuccess?: (result: PaymentConfirmationResult) => void;
  onError?: (error: Error | unknown) => void;
}

export function MockCheckoutForm({
  orderId,
  userId,
  amount,
  currency,
  portraitIds,
  onSuccess,
  onError,
}: MockCheckoutFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const paymentService = getPaymentService();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(''); // MM/YY
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  useEffect(() => {
    // Create a payment intent when the component mounts or order details change
    const createIntent = async () => {
      setIsProcessing(true);
      setErrorMessage(null);
      try {
        const params: PaymentParameters = {
          amount,
          currency,
          orderId,
          userId,
          metadata: { portraitIds, customerName: cardName || 'Mock Customer' }
        };
        const intent = await paymentService.createPaymentIntent(params);
        setPaymentIntent(intent);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        setErrorMessage(`Failed to initialize payment: ${errorMessage}`);
        if (onError) onError(e);
      }
      setIsProcessing(false);
    };

    if (orderId && userId && amount > 0 && currency) {
      createIntent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, userId, amount, currency, cardName, portraitIds]); // paymentService is stable

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentIntent || !paymentIntent.id) {
      setErrorMessage('Payment intent not initialized. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate payment method details (in a real scenario, these come from Stripe Elements, etc.)
      const mockPaymentMethodDetails = {
        card: {
          number: cardNumber,
          exp_month: parseInt(expiryDate.split('/')[0], 10),
          exp_year: parseInt(expiryDate.split('/')[1], 10),
          cvc: cvc,
          name: cardName,
        },
        billing_details: {
          name: cardName,
        },
      };

      const result = await paymentService.confirmPayment(paymentIntent.id, mockPaymentMethodDetails);

      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: result.message || `Order ${result.orderId} completed.`,
        });
        if (onSuccess) onSuccess(result);
        // Redirect to an order confirmation page, e.g.:
        router.push(`/order-confirmation?orderId=${result.orderId}&status=success`);
      } else {
        setErrorMessage(result.error?.message || result.message || 'Payment failed. Please try again.');
        toast({
          title: "Payment Failed",
          description: result.error?.message || result.message || 'Please check your card details or try another card.',
          variant: "destructive",
        });
        if (onError) onError(result.error || new Error(result.message));
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      setErrorMessage(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (onError) onError(e);
    }
    setIsProcessing(false);
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 2) {
      v = v.slice(0, 2) + '/' + v.slice(2, 4);
    } else if (v.length === 2 && expiryDate.length === 1 && !v.includes('/')) {
        // If user types 2 digits and previous was 1 (e.g. 1 -> 12), add slash
        v = v + '/';
    }
    return v.slice(0, 5);
  };

  if (!paymentIntent && !isProcessing && !errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Initializing secure payment...</p>
      </div>
    );
  }

  if (errorMessage && !paymentIntent) { // Error during initialization
     return (
      <div className="p-4 border rounded-lg shadow-md bg-destructive/10 text-destructive">
        <h3 className="font-semibold">Payment Initialization Failed</h3>
        <p>{errorMessage}</p>
        <Button onClick={() => window.location.reload()} className="mt-2">Try Again</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 border rounded-lg shadow-md">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">Mock Payment</h2>
        <p className="text-muted-foreground">
          Total Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
        </p>
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md mt-2">
          This is a **simulated** payment form. Do not enter real card details.
          Use card ending in <strong>0002</strong> for decline, <strong>0003</strong> for insufficient funds.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardName">Name on Card</Label>
          <Input 
            id="cardName"
            type="text" 
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Mock E. Cardholder"
            required
            disabled={isProcessing}
          />
        </div>
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input 
            id="cardNumber"
            type="text" 
            value={formatCardNumber(cardNumber)}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4111 1111 1111 1111"
            required
            disabled={isProcessing}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input 
              id="expiryDate"
              type="text" 
              value={formatExpiryDate(expiryDate)}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="MM/YY"
              required
              disabled={isProcessing}
            />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input 
              id="cvc"
              type="text" 
              value={cvc.replace(/\D/g, '').slice(0,3)}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              maxLength={3}
              required
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={isProcessing || !paymentIntent}
        className="w-full"
      >
        {isProcessing ? 
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 
          `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}`
        }
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        Order ID: {orderId} (For reference)
      </p>
    </form>
  );
} 