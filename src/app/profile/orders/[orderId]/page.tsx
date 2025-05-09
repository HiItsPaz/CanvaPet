'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderByIdForUser } from '@/lib/payments/orderApi';
import { getPrintifyOrderStatus, PrintifyAddress } from '@/lib/printify/client';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Package, Home, Truck } from 'lucide-react';
import { format } from 'date-fns';

// Define more specific types
// Add potentially missing fields to Order type for this component context
type Order = Database['public']['Tables']['orders']['Row'] & {
  items?: CartItem[]; 
  printify_order_id?: string;
  // 'amount' is named 'total_amount' in the DB schema, but original code used 'amount'
  // We will use total_amount from the DB but if the fetchedOrder somehow has 'amount', 
  // it will be preferred by the formatCurrency calls if not careful.
  // Let's ensure we consistently use total_amount from the DB type and make CartItem use price.
};

interface PrintifyShipment {
  carrier: string;
  tracking_number: string; 
  tracking_url: string;
  shipped_at?: string; 
}

interface PrintifyOrderData {
  status: string;
  shipments?: PrintifyShipment[];
}

interface PrintifyOrderResource {
  id: string;
  data: PrintifyOrderData;
}

interface PrintifyOrderEvent {
  type: string;
  resource?: PrintifyOrderResource;
}

interface CartItem {
  id?: string; 
  productTitle?: string;
  variantTitle?: string;
  quantity: number;
  price: number; // Price per item in the cart, should align with order_items.unit_price
  imageUrl?: string; 
}

// Helper to format currency
const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
};

// Helper for status badge
const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
     switch (status?.toLowerCase()) {
      case 'completed': 
      case 'delivered': return 'default';
      case 'pending_payment':
      case 'pending':
      case 'on-hold':
      case 'processing': 
      case 'in-production': return 'secondary';
      case 'payment_failed': 
      case 'canceled': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'secondary';
    }
};

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [printifyOrder, setPrintifyOrder] = useState<PrintifyOrderEvent | PrintifyOrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError('Invalid order ID.');
            setLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedOrder = await getOrderByIdForUser(orderId) as Order | null; // Assert type here
                if (!fetchedOrder) {
                    throw new Error('Order not found or access denied.');
                }
                setOrder(fetchedOrder);

                if (fetchedOrder.printify_order_id) { // Now checks optional property
                    const printifyStatus = await getPrintifyOrderStatus(fetchedOrder.printify_order_id);
                    setPrintifyOrder(printifyStatus as PrintifyOrderEvent | PrintifyOrderData);
                }

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load order details.';
                setError(errorMessage);
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const orderItems: CartItem[] = useMemo(() => {
        if (!order?.items) return []; // Access optional items
        try {
            return Array.isArray(order.items) ? order.items : [];
        } catch (e) {
            console.error("Failed to process order items:", e);
            return [];
        }
    }, [order]);

    if (loading) {
        return (
             <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        );
    }

    if (error) {
        return (
             <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-lg font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                    <Link href="/profile/orders" passHref>
                        <Button variant="outline" className="mt-4">Back to Orders</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return <p>Order not found.</p>;
    }

    const displayStatus = (printifyOrder as PrintifyOrderEvent)?.resource?.data?.status || (printifyOrder as PrintifyOrderData)?.status || order.status || 'unknown';
    const shippingAddress = order.shipping_address as PrintifyAddress | null;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold">Order Details</h1>
                 <Link href="/profile/orders" passHref>
                    <Button variant="outline">Back to Order History</Button>
                 </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                             <CardTitle>Order #{order.id.substring(0,8)}...</CardTitle>
                             <CardDescription>
                                Placed on {order.created_at ? format(new Date(order.created_at), 'PPP') : 'N/A'}
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold mb-3">Items</h3>
                            <ul className="space-y-3">
                                {orderItems.map((item, index) => (
                                    <li key={item.id || index} className="flex justify-between items-start gap-4 text-sm">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium">{item.productTitle || 'Product'}</p>
                                                <p className="text-xs text-muted-foreground">{item.variantTitle || 'Variant'}</p>
                                            </div>
                                        </div>
                                        <span>x {item.quantity}</span>
                                        <span>{formatCurrency(item.price * item.quantity, order.currency || 'USD')}</span>
                                    </li>
                                ))}
                            </ul>
                            <Separator className="my-4"/>
                             <div className="space-y-1 text-sm">
                                 <div className="flex justify-between">
                                     <span>Subtotal</span>
                                     {/* Use total_amount from the Order type, which should be in cents */}
                                     <span>{formatCurrency(order.total_amount, order.currency || 'USD')}</span> 
                                 </div>
                                 <div className="flex justify-between font-bold text-base">
                                     <span>Total</span>
                                     <span>{formatCurrency(order.total_amount, order.currency || 'USD')}</span>
                                 </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5"/> Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getStatusBadgeVariant(displayStatus)} className="text-sm capitalize">
                                {displayStatus.replace('_', ' ')}
                            </Badge>
                            {(printifyOrder as PrintifyOrderEvent)?.resource?.data?.shipments?.length ?? 0 > 0 ? (
                                <div className="mt-4 text-sm space-y-1">
                                    <p className="font-medium flex items-center gap-1"><Truck className="h-4 w-4"/> Tracking:</p>
                                    {(printifyOrder as PrintifyOrderEvent).resource!.data.shipments!.map((shipment: PrintifyShipment, idx: number) => (
                                        <a 
                                            key={idx} 
                                            href={shipment.tracking_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline block truncate"
                                        >
                                            {shipment.tracking_number} ({shipment.carrier})
                                        </a>
                                    ))}
                                </div>
                            ) : ((printifyOrder as PrintifyOrderData)?.shipments?.length ?? 0) > 0 ? (
                                <div className="mt-4 text-sm space-y-1">
                                    <p className="font-medium flex items-center gap-1"><Truck className="h-4 w-4"/> Tracking:</p>
                                    {(printifyOrder as PrintifyOrderData).shipments!.map((shipment: PrintifyShipment, idx: number) => (
                                        <a 
                                            key={idx} 
                                            href={shipment.tracking_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline block truncate"
                                        >
                                            {shipment.tracking_number} ({shipment.carrier})
                                        </a>
                                    ))}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                                 <Home className="h-5 w-5"/> Shipping Address
                             </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                             {shippingAddress ? (
                                <>
                                    <p>{shippingAddress.first_name} {shippingAddress.last_name}</p>
                                    <p>{shippingAddress.address1}</p>
                                    {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                                    <p>{shippingAddress.city}, {shippingAddress.region} {shippingAddress.zip}</p>
                                    <p>{shippingAddress.country}</p>
                                    {shippingAddress.email && <p>Email: {shippingAddress.email}</p>}
                                    {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                                </> 
                             ) : (
                                 <p className="text-muted-foreground">No shipping address available.</p>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 