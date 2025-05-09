'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderByIdForUser } from '@/lib/payments/orderApi';
import { getPrintifyOrderStatus, PrintifyAddress } from '@/lib/printify/client'; // Assuming types are defined here too
import { Database } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Package, Home, Truck } from 'lucide-react';
import { format } from 'date-fns';

// Assuming types are properly defined/imported
type Order = Database['public']['Tables']['orders']['Row'];
type PrintifyOrder = any; // Define more accurately based on getPrintifyOrderStatus response
type CartItem = any; // Define based on structure stored in order.items

// Helper to format currency (same as in checkout)
const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
};

// Helper for status badge (same as in order history)
const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    // ... (same implementation)
     switch (status?.toLowerCase()) {
      case 'completed': 
      case 'delivered': return 'default'; // Treat delivered as completed
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
    const [printifyOrder, setPrintifyOrder] = useState<PrintifyOrder | null>(null);
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
                const fetchedOrder = await getOrderByIdForUser(orderId);
                if (!fetchedOrder) {
                    throw new Error('Order not found or access denied.');
                }
                setOrder(fetchedOrder);

                // Use type assertion temporarily due to type gen issues
                const currentOrder = fetchedOrder as any;
                if (currentOrder.printify_order_id) {
                    const printifyStatus = await getPrintifyOrderStatus(currentOrder.printify_order_id);
                    setPrintifyOrder(printifyStatus);
                }

            } catch (err: any) {
                setError(err.message || 'Failed to load order details.');
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    // Safely parse items JSONB
    const orderItems: CartItem[] = useMemo(() => {
        const currentOrder = order as any; // Temporary cast
        if (!currentOrder?.items) return [];
        try {
            // Assuming items is already an array/object, no need to parse if using JSONB type
            return Array.isArray(currentOrder.items) ? currentOrder.items : [];
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
        // Should be caught by error state usually
        return <p>Order not found.</p>;
    }

    // Cast order to any temporarily for property access
    const currentOrder = order as any;

    // Display Logic
    const displayStatus = printifyOrder?.status || currentOrder.status || 'unknown';
    const shippingAddress = currentOrder.shipping_address as PrintifyAddress | null;

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold">Order Details</h1>
                 <Link href="/profile/orders" passHref>
                    <Button variant="outline">Back to Order History</Button>
                 </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Items & Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                             <CardTitle>Order #{currentOrder.id.substring(0,8)}...</CardTitle>
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
                                            {/* Add item image if available in item.metadata or fetchable */}
                                            {/* <img src={item.imageUrl || 'placeholder.png'} alt={item.productTitle} className="w-12 h-12 object-cover rounded"/> */} 
                                            <div>
                                                <p className="font-medium">{item.productTitle || 'Product'}</p>
                                                <p className="text-xs text-muted-foreground">{item.variantTitle || 'Variant'}</p>
                                            </div>
                                        </div>
                                        <span>x {item.quantity}</span>
                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Separator className="my-4"/>
                             <div className="space-y-1 text-sm">
                                 <div className="flex justify-between">
                                     <span>Subtotal</span>
                                     <span>{formatCurrency(currentOrder.amount)}</span> 
                                     {/* Note: order.amount might include shipping already, adjust if needed */}
                                 </div>
                                 {/* Display Shipping cost if available separately */} 
                                 <div className="flex justify-between font-bold text-base">
                                     <span>Total</span>
                                     <span>{formatCurrency(currentOrder.amount)}</span>
                                 </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Status & Address */}
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
                            {/* Optionally show Printify status details */} 
                            {printifyOrder?.shipments?.length > 0 && (
                                <div className="mt-4 text-sm space-y-1">
                                    <p className="font-medium flex items-center gap-1"><Truck className="h-4 w-4"/> Tracking:</p>
                                    {printifyOrder.shipments.map((shipment: any, idx: number) => (
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
                            )}
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