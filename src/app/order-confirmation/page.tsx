'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getOrderByIdForUser } from '@/lib/payments/orderApi';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Package, ShoppingBag } from 'lucide-react';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('orderId');
  const printifyId = searchParams.get('printifyId');
  const status = searchParams.get('status');
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const orderData = await getOrderByIdForUser(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not fetch order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(amount / 100);
  };
  
  // If no order ID was provided, show error
  if (!orderId && !loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find any order details to display.</p>
        <Button asChild>
          <Link href="/merch">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your order details...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Something Went Wrong</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button asChild>
          <Link href="/profile/orders">View Order History</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          {printifyId && (
            <Badge variant="outline" className="mt-2">
              Printify Order ID: {printifyId}
            </Badge>
          )}
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Number:</span>
                <span>{orderId?.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge variant={status === 'submitted' ? 'default' : 'secondary'}>
                  {status || 'Processing'}
                </Badge>
              </div>
              
              {order && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Items</h3>
                    {order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex gap-3">
                          {item.image && (
                            <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                              <Image
                                src={item.image}
                                alt={item.title || 'Product image'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {Object.entries(item.options || {}).map(([key, value]) => 
                                `${key}: ${value}`
                              ).join(', ')}
                            </p>
                            {item.customization?.portraitId && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Customized
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p>{formatCurrency(item.price * (item.quantity || 1))}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.total_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatCurrency(order.shipping_cost || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency((order.total_amount || 0) + (order.shipping_cost || 0))}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {order?.shipping_address && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic">
                {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                {order.shipping_address.address1}<br />
                {order.shipping_address.address2 && <>{order.shipping_address.address2}<br /></>}
                {order.shipping_address.city}, {order.shipping_address.region} {order.shipping_address.zip}<br />
                {order.shipping_address.country}
              </address>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/profile/orders">
              View Order History
            </Link>
          </Button>
          <Button asChild>
            <Link href="/merch">
              Continue Shopping <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about your order? <Link href="/help" className="text-primary underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 