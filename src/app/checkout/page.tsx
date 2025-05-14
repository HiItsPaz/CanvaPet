'use client';

import { CheckoutForm } from '@/components/payments/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <CheckoutForm />
    </div>
  );
} 