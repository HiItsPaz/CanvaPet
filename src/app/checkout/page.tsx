'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { MockCheckoutForm } from '@/components/payments/MockCheckoutForm';
import { getPrintifyShippingRates, createPrintifyOrder, PrintifyAddress, PrintifyLineItemInput, PrintifyOrderInput, PrintifyShippingOption } from '@/lib/printify/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingCart } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid'; // For generating internal order ID
import { createClient } from '@/lib/supabase/client'; // Import client supabase
import { PaymentConfirmationResult } from '@/lib/payments/types'; // Added import

// Helper to format currency
const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
};

export default function CheckoutPage() {
    const { items, getItemCount, getTotalPrice, clearCart } = useCartStore();
    const router = useRouter();
    const { toast } = useToast();

    const [shippingAddress, setShippingAddress] = useState<Partial<PrintifyAddress>>({});
    const [shippingOptions, setShippingOptions] = useState<PrintifyShippingOption[]>([]);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<number | null>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [internalOrderId, setInternalOrderId] = useState<string>(`order_${uuidv4()}`); // Generate unique ID for this checkout attempt
    const [showPayment, setShowPayment] = useState(false);
    const [userId, setUserId] = useState<string | null>(null); // Add state for userId
    const [authLoading, setAuthLoading] = useState(true);

    const totalItemsPrice = getTotalPrice();
    const selectedShippingCost = shippingOptions.find(opt => opt.method_id === selectedShippingMethod)?.price ?? 0;
    const totalPrice = totalItemsPrice + selectedShippingCost;

    // Fetch user ID on mount
    useEffect(() => {
        const getUserId = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setUserId(session?.user?.id ?? null);
            setAuthLoading(false);
        };
        getUserId();
    }, []);

    // Debounce address input before fetching shipping
    useEffect(() => {
        const handler = setTimeout(() => {
            if (
                shippingAddress.country && 
                shippingAddress.region && 
                shippingAddress.zip && 
                items.length > 0
            ) {
                fetchShippingRates();
            }
        }, 1000); // Fetch rates 1 second after user stops typing address

        return () => {
            clearTimeout(handler);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shippingAddress.country, shippingAddress.region, shippingAddress.zip, items]); // Re-fetch if items change too?

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setShippingOptions([]); // Clear old options when address changes
        setSelectedShippingMethod(null);
        setShippingError(null);
    };

    const fetchShippingRates = async () => {
        if (!shippingAddress.country || !shippingAddress.region || !shippingAddress.zip) return;
        
        setLoadingShipping(true);
        setShippingError(null);
        try {
            const address = {
                country: shippingAddress.country,
                region: shippingAddress.region,
                zip: shippingAddress.zip
            };
            const lineItems = items.map(item => ({ 
                variant_id: item.variantId, 
                quantity: item.quantity 
            }));
            
            const rates = await getPrintifyShippingRates(address, lineItems);
            setShippingOptions(rates);
            // Auto-select cheapest if available?
            if (rates.length > 0) {
                 setSelectedShippingMethod(rates[0].method_id); // Select first/default
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setShippingError(err.message || 'Could not fetch shipping rates.');
            } else {
                setShippingError('Could not fetch shipping rates.');
            }
            console.error(err);
        } finally {
            setLoadingShipping(false);
        }
    };

    const handleProceedToPayment = () => {
        // Validate address and shipping selection
        if (!isAddressComplete(shippingAddress)) {
             toast({ title: "Incomplete Address", description: "Please fill in all required shipping address fields.", variant: "destructive" });
            return;
        }
         if (!selectedShippingMethod) {
             toast({ title: "Select Shipping", description: "Please select a shipping method.", variant: "destructive" });
            return;
        }
        setShowPayment(true);
    };

    const handlePaymentSuccess = async (paymentResult: PaymentConfirmationResult) => {
        console.log("Payment Success! Result:", paymentResult);
        setIsSubmitting(true); // Now submit to Printify
        setPaymentError(null);

        try {
            // Prepare Printify order payload
            const lineItems: PrintifyLineItemInput[] = items.map(item => ({
                blueprint_id: item.blueprintId, // Assuming this is needed
                variant_id: item.variantId,
                quantity: item.quantity,
                print_areas: {
                    // Define print area based on product/customization
                    // This needs actual implementation based on how customization data is stored/passed
                    front: { src: item.portraitImageUrl } // Example
                }
            }));

            const orderInput: PrintifyOrderInput = {
                external_id: internalOrderId, // Use our internal ID
                line_items: lineItems,
                shipping_method: selectedShippingMethod!, // We validated this earlier
                send_shipping_notification: true,
                address_to: shippingAddress as PrintifyAddress // Assume complete address
            };

            const printifyOrder = await createPrintifyOrder(orderInput);
            console.log("Printify Order Created:", printifyOrder);

            // Update internal order status maybe?
            // The mock payment already set it to 'completed', maybe add printify_order_id?
            // await updateInternalOrderStatus(internalOrderId, 'submitted_to_printify', { printifyOrderId: printifyOrder.id });

            toast({ title: "Order Submitted!", description: `Your order has been submitted to Printify (ID: ${printifyOrder.id}).` });
            clearCart(); // Clear cart on success
            router.push(`/order-confirmation?orderId=${internalOrderId}&printifyId=${printifyOrder.id}&status=submitted`);

        } catch (err: unknown) {
            console.error("Failed to submit order to Printify:", err);
            if (err instanceof Error) {
                setPaymentError(`Payment succeeded, but failed to submit order to Printify: ${err.message}. Please contact support.`);
                toast({ title: "Order Submission Failed", description: `Your payment was successful, but we couldn\'t submit the order to Printify. Please contact support with Order ID ${internalOrderId}.`, variant: "destructive", duration: 10000 });
            } else {
                setPaymentError('Payment succeeded, but failed to submit order to Printify. An unknown error occurred. Please contact support.');
                toast({ title: "Order Submission Failed", description: `Your payment was successful, but we couldn\'t submit the order to Printify. Please contact support with Order ID ${internalOrderId}.`, variant: "destructive", duration: 10000 });
            }
            // Need robust error handling here - payment taken but order failed!
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentError = (error: unknown) => {
        console.error("Payment Failed! Error:", error);
        // Error already shown by MockCheckoutForm toast
        if (error instanceof Error) {
            setPaymentError(error.message || 'Payment failed.');
        } else {
            setPaymentError('Payment failed due to an unknown error.');
        }
    };
    
    const isAddressComplete = (addr: Partial<PrintifyAddress>): addr is PrintifyAddress => {
        return !!(addr.first_name && addr.last_name && addr.address1 && addr.city && addr.region && addr.country && addr.zip);
    };

    // Add loading state for auth
    if (authLoading) { /* ... loading indicator ... */ }
    
    // Handle case where user is not logged in
    if (!userId) { /* ... login prompt ... */ }

    // Handle empty cart
    if (items.length === 0 && !isSubmitting) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-6">Add some merchandise to get started.</p>
                <Link href="/merch" passHref>
                    <Button>Browse Merchandise</Button>
                </Link>
            </div>
        );
    }

    // Main component render (userId is guaranteed to be non-null here)
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <div className="grid md:grid-cols-2 gap-12">
                {/* Order Summary & Shipping Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span>{item.productTitle} ({item.variantTitle}) x {item.quantity}</span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between font-semibold">
                                <span>Subtotal</span>
                                <span>{formatCurrency(totalItemsPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>
                                    {selectedShippingMethod ? 
                                        formatCurrency(selectedShippingCost) :
                                        (loadingShipping ? 'Calculating...' : '-')
                                    }
                                </span>
                            </div>
                             <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(totalPrice)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {/* Basic Address Form - improve with validation later */}
                           <div className="grid grid-cols-2 gap-4">
                               <div><Label htmlFor="first_name">First Name</Label><Input name="first_name" id="first_name" onChange={handleAddressChange} required /></div>
                               <div><Label htmlFor="last_name">Last Name</Label><Input name="last_name" id="last_name" onChange={handleAddressChange} required /></div>
                           </div>
                           <div><Label htmlFor="address1">Address Line 1</Label><Input name="address1" id="address1" onChange={handleAddressChange} required /></div>
                           <div><Label htmlFor="address2">Address Line 2 (Optional)</Label><Input name="address2" id="address2" onChange={handleAddressChange} /></div>
                           <div className="grid grid-cols-3 gap-4">
                               <div><Label htmlFor="city">City</Label><Input name="city" id="city" onChange={handleAddressChange} required /></div>
                               <div><Label htmlFor="region">State/Province</Label><Input name="region" id="region" placeholder="e.g., CA" onChange={handleAddressChange} required /></div>
                               <div><Label htmlFor="zip">ZIP/Postal Code</Label><Input name="zip" id="zip" onChange={handleAddressChange} required /></div>
                           </div>
                           <div><Label htmlFor="country">Country</Label><Input name="country" id="country" placeholder="e.g., US" onChange={handleAddressChange} required /></div>
                           <div><Label htmlFor="email">Email</Label><Input name="email" type="email" id="email" onChange={handleAddressChange} /></div>
                           <div><Label htmlFor="phone">Phone (Optional)</Label><Input name="phone" type="tel" id="phone" onChange={handleAddressChange} /></div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                         <CardHeader>
                            <CardTitle>Shipping Method</CardTitle>
                         </CardHeader>
                         <CardContent>
                             {loadingShipping && <Loader2 className="h-5 w-5 animate-spin" />} 
                             {shippingError && <p className="text-sm text-destructive">Error: {shippingError}</p>}
                             {!loadingShipping && !shippingError && shippingOptions.length === 0 && shippingAddress.country && shippingAddress.zip && (
                                 <p className="text-sm text-muted-foreground">Enter address details to see shipping options.</p> 
                             )}
                             {!loadingShipping && !shippingError && shippingOptions.length > 0 && (
                                <RadioGroup value={String(selectedShippingMethod)} onValueChange={(val) => setSelectedShippingMethod(Number(val))}>
                                    {shippingOptions.map(opt => (
                                        <div key={opt.method_id} className="flex items-center justify-between border p-3 rounded-md">
                                            <Label htmlFor={`shipping-${opt.method_id}`} className="font-medium cursor-pointer">{opt.name}</Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{formatCurrency(opt.price)}</span>
                                                <RadioGroupItem value={String(opt.method_id)} id={`shipping-${opt.method_id}`} />
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                             )}
                         </CardContent>
                    </Card>
                </div>

                {/* Payment Column */}
                <div>
                    <Card>
                        <CardHeader>
                             <CardTitle>Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {!showPayment ? (
                                 <Button 
                                    onClick={handleProceedToPayment} 
                                    className="w-full" 
                                    disabled={!isAddressComplete(shippingAddress) || !selectedShippingMethod || loadingShipping}
                                 >
                                     Proceed to Payment
                                 </Button>
                             ) : isSubmitting ? (
                                 <div className="flex items-center justify-center p-4">
                                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                     <span>Submitting order to Printify...</span>
                                 </div>
                             ) : ( 
                                 // Add check for userId before rendering the form
                                 userId && 
                                 <MockCheckoutForm
                                     key={internalOrderId} 
                                     orderId={internalOrderId}
                                     userId={userId} // Now guaranteed to be string
                                     amount={totalPrice}
                                     currency={shippingOptions[0]?.currency || 'USD'} 
                                     portraitIds={items.map(i => i.portraitId)} 
                                     onSuccess={handlePaymentSuccess}
                                     onError={handlePaymentError}
                                 />
                             )}
                            {paymentError && <p className="text-sm text-destructive mt-4">Error: {paymentError}</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 