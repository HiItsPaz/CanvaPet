'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, Controller, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore, CartItem } from '@/stores/cart';
import { useToast } from '@/components/ui/use-toast';
import { getPrintifyShippingRates, createPrintifyOrder, PrintifyAddress, PrintifyShippingOption } from '@/lib/printify/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ArrowRight, ShoppingCart, Truck, Home, CreditCard } from 'lucide-react';
import { MockCheckoutForm } from './MockCheckoutForm';
import { PaymentConfirmationResult } from '@/lib/payments/types';
import { v4 as uuidv4 } from 'uuid';
import AddressAutocompleteInput, { AddressDetails } from '@/components/ui/AddressAutocompleteInput';
import { FormErrorIcon } from '@/components/ui/FormErrorIcon';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { useApiError } from '@/hooks/use-api-error';
import { InfoIcon } from '@/components/ui/InfoIcon';
import { OrderSummary } from './OrderSummary';

// Define the billing address interface to match the schema
interface BillingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}

// Use exact property names that match the Printify API with proper TypeScript interface
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  zip: string;
  country: string;
  sameAsBilling: boolean;
  billingAddress?: BillingAddress;
}

// Modify the schema to make sameAsBilling optional with a default
const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  address1: z.string().min(5, { message: 'Address is required' }),
  address2: z.string().optional(),
  city: z.string().min(2, { message: 'City is required' }),
  region: z.string().min(2, { message: 'State/Province is required' }),
  zip: z.string().min(4, { message: 'Postal/ZIP code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  sameAsBilling: z.boolean().optional().default(true),
  billingAddress: z.object({
    firstName: z.string().min(2, { message: 'First name is required' }),
    lastName: z.string().min(2, { message: 'Last name is required' }),
    address1: z.string().min(5, { message: 'Address is required' }),
    address2: z.string().optional(),
    city: z.string().min(2, { message: 'City is required' }),
    region: z.string().min(2, { message: 'State/Province is required' }),
    zip: z.string().min(4, { message: 'Postal/ZIP code is required' }),
    country: z.string().min(2, { message: 'Country is required' }),
  }).optional(),
});

// Add conditional validation in the parent schema
const checkoutFormSchema = formSchema.superRefine((data, ctx) => {
  if (data.sameAsBilling === false && !data.billingAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Billing address is required when different from shipping',
      path: ['billingAddress'],
    });
  } 
  // If billingAddress is provided, ensure its fields are valid (they are already by their own schema)
  // This superRefine is primarily for the conditional requirement of the billingAddress object itself.
});

// Create a type from the schema
type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Helper for currency formatting
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

// Enum for checkout steps
enum CheckoutStep {
  ReviewCart = 0,
  ShippingAddress = 1,
  ShippingMethod = 2,
  Payment = 3,
}

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.ReviewCart);
  const [progress, setProgress] = useState(25);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<PrintifyShippingOption[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [internalOrderId] = useState(() => uuidv4());
  
  // Total calculation
  const totalItemsPrice = getTotalPrice();
  const totalPrice = totalItemsPrice + shippingCost;
  
  // Form
  const form = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      region: '',
      zip: '',
      country: '',
      sameAsBilling: true,
      billingAddress: {
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        region: '',
        zip: '',
        country: '',
      },
    },
  });
  
  const { watch, getValues, trigger, control, setValue: setFormValue } = form;
  
  // Watch for shipping address changes to fetch shipping rates
  const addressFields = watch([
    'address1',
    'city',
    'region',
    'zip',
    'country',
  ]);
  
  // Get the shipping address for API calls
  const getShippingAddressForApi = (): Partial<PrintifyAddress> => {
    const formValues = getValues();
    return {
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      address1: formValues.address1,
      address2: formValues.address2,
      city: formValues.city,
      region: formValues.region,
      zip: formValues.zip,
      country: formValues.country,
      email: formValues.email,
      phone: formValues.phone,
    };
  };
  
  // Check if address fields are filled enough to fetch shipping rates
  const canFetchShippingRates = (): boolean => {
    const address = getShippingAddressForApi();
    return !!(address.country && address.zip && address.city && address.region);
  };
  
  // Add form persistence
  const { 
    saveFormData, 
    loadFormData, 
    clearFormData, 
    hasData 
  } = useFormPersistence<z.infer<typeof checkoutFormSchema>>({
    key: 'checkout-form-data',
    excludes: ['paymentMethod'], // Don't persist sensitive payment data
  });
  
  // Add API error handling for shipping rates and payment
  const {
    error: shippingApiError,
    message: shippingErrorMessage,
    isLoading: isRetryingShipping,
    withErrorHandling: withShippingErrorHandling,
    retryAfterError: retryShipping,
  } = useApiError({
    maxRetries: 2,
    toastErrors: true,
  });
  
  const {
    error: paymentApiError,
    message: paymentErrorMessage,
    isLoading: isRetryingPayment,
    withErrorHandling: withPaymentErrorHandling,
  } = useApiError({
    toastErrors: true,
  });
  
  // Try to load saved form data on first render
  useEffect(() => {
    const savedFormData = loadFormData();
    if (savedFormData) {
      // Set the form values from saved data
      Object.entries(savedFormData).forEach(([key, value]) => {
        if (value !== undefined) {
          setFormValue(key as any, value);
        }
      });
      
      // Show toast to inform user
      toast({
        title: "Form Restored",
        description: "Your checkout information has been restored.",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save form data when values change
  const saveFormDataMemoized = useCallback((data: z.infer<typeof checkoutFormSchema>) => {
    saveFormData(data as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const subscription = form.watch((formValues) => {
      saveFormDataMemoized(formValues as z.infer<typeof checkoutFormSchema>);
    });
    
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveFormDataMemoized]);
  
  // Fetch shipping rates when address fields change
  useEffect(() => {
    if (currentStep >= CheckoutStep.ShippingMethod && canFetchShippingRates()) {
      fetchShippingRates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressFields, currentStep]);
  
  // Update progress bar
  useEffect(() => {
    // Update progress based on the current step
    switch (currentStep) {
      case CheckoutStep.ReviewCart:
        setProgress(25);
        break;
      case CheckoutStep.ShippingAddress:
        setProgress(50);
        break;
      case CheckoutStep.ShippingMethod:
        setProgress(75);
        break;
      case CheckoutStep.Payment:
        setProgress(100);
        break;
    }
  }, [currentStep]);
  
  // Updated shipping rates fetching with error handling
  const fetchShippingRates = async () => {
    if (!canFetchShippingRates()) return;
    
    setIsLoadingRates(true);
    setShippingError(null);
    
    try {
      await withShippingErrorHandling(async () => {
        const address = getShippingAddressForApi();
        // Prepare the request payload for shipping rate calculation
        const blueprintIds = items.map(item => item.blueprintId);
        const variantIds = items.map(item => item.variantId);
        const quantities = items.map(item => item.quantity);
        
        // Create lineItems array with expected structure for the shipping rates call
        const lineItems = items.map(item => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          blueprint_id: item.blueprintId
        }));
        
        const rates = await getPrintifyShippingRates(
          {
            country: address.country || '',
            region: address.region || '',
            zip: address.zip || ''
          },
          lineItems
        );
        
        if (rates && rates.length > 0) {
          setShippingOptions(rates);
          // Auto-select cheapest option if none selected
          if (!selectedShippingMethod) {
            const cheapestOption = rates.reduce((prev, curr) => 
              prev.price < curr.price ? prev : curr
            );
            setSelectedShippingMethod(cheapestOption.method_id);
            setShippingCost(cheapestOption.price);
          }
        } else {
          setShippingOptions([]);
          setSelectedShippingMethod(null);
          setShippingCost(0);
          setShippingError('No shipping methods available for this address');
        }
      });
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      setShippingError(shippingErrorMessage || 'Failed to calculate shipping. Please check your address.');
      setShippingOptions([]);
      setSelectedShippingMethod(null);
      setShippingCost(0);
    } finally {
      setIsLoadingRates(false);
    }
  };
  
  // Navigate between steps
  const goToNextStep = async () => {
    if (currentStep === CheckoutStep.ShippingAddress) {
      // Validate shipping form fields before proceeding
      const isValid = await trigger([
        'firstName',
        'lastName',
        'email',
        'address1',
        'city',
        'region',
        'zip',
        'country',
      ]);
      
      if (!isValid) return;
    }
    
    if (currentStep === CheckoutStep.ShippingMethod && !selectedShippingMethod) {
      toast({
        title: 'Please select a shipping method',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentStep < CheckoutStep.Payment) {
      setCurrentStep(prevStep => (prevStep + 1) as CheckoutStep);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > CheckoutStep.ReviewCart) {
      setCurrentStep(prevStep => (prevStep - 1) as CheckoutStep);
    }
  };
  
  // Handle shipping method selection
  const handleShippingMethodSelect = (methodId: string) => {
    const selectedMethod = shippingOptions.find(opt => opt.method_id === Number(methodId));
    if (selectedMethod) {
      setSelectedShippingMethod(selectedMethod.method_id);
      setShippingCost(selectedMethod.price);
    }
  };
  
  // Update payment success handler with form clearing
  const handlePaymentSuccess = async (paymentResult: PaymentConfirmationResult) => {
    console.log('Payment successful:', paymentResult);
    setIsSubmitting(true);
    setPaymentError(null);
    
    try {
      await withPaymentErrorHandling(async () => {
        // Get the final shipping address
        const formValues = getValues();
        const shippingAddress: PrintifyAddress = {
          first_name: formValues.firstName,
          last_name: formValues.lastName,
          address1: formValues.address1,
          address2: formValues.address2 || '',
          city: formValues.city,
          region: formValues.region,
          zip: formValues.zip,
          country: formValues.country,
          email: formValues.email,
          phone: formValues.phone || '',
        };
        
        // Prepare line items for Printify
        const lineItems = items.map(item => ({
          blueprint_id: item.blueprintId,
          variant_id: item.variantId,
          quantity: item.quantity,
          print_areas: {
            front: { src: item.customization?.portraitUrl || '' }
          }
        }));
        
        // Create Printify order
        const orderInput = {
          external_id: internalOrderId,
          line_items: lineItems,
          shipping_method: selectedShippingMethod!,
          send_shipping_notification: true,
          address_to: shippingAddress
        };
        
        // Call the API to create the order
        const printifyOrder = await createPrintifyOrder(orderInput);
        
        toast({
          title: 'Order Confirmed!',
          description: `Your order has been submitted successfully.`,
        });
        
        // Clear form data from storage
        clearFormData();
        
        // Clear cart and redirect to confirmation page
        clearCart();
        router.push(`/order-confirmation?orderId=${internalOrderId}&printifyId=${printifyOrder.id}&status=submitted`);
      });
    } catch (err) {
      console.error('Error submitting order:', err);
      setPaymentError(paymentErrorMessage || 'Payment succeeded but failed to submit order. Please contact support.');
      toast({
        title: 'Order Submission Failed',
        description: 'Payment successful, but there was an issue submitting your order. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle payment error
  const handlePaymentError = (error: unknown) => {
    console.error('Payment failed:', error);
    if (error instanceof Error) {
      setPaymentError(error.message);
    } else {
      setPaymentError('Payment failed due to an unknown error.');
    }
  };
  
  // Render main checkout content
  const renderCheckoutContent = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Add items to your cart to continue checkout.</p>
          <Button asChild className="mt-6">
            <a href="/merch">Browse Products</a>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderStepContent()}
        </div>
        <div className="lg:col-span-1 order-first lg:order-last mb-6 lg:mb-0">
          <OrderSummary 
            showItems={currentStep === CheckoutStep.ReviewCart} 
            shippingCost={shippingCost} 
            selectedShippingMethod={selectedShippingMethod}
            editable={true}
            sticky={true}
          />
        </div>
      </div>
    );
  };
  
  // Render step content without the order summary (it's now in the main layout)
  const renderStepContent = () => {
    switch (currentStep) {
      case CheckoutStep.ReviewCart:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Review Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Review your items and proceed to checkout when you're ready.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href="/merch">Continue Shopping</a>
              </Button>
              <Button onClick={goToNextStep}>
                Continue to Shipping <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case CheckoutStep.ShippingAddress:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control as any}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.firstName && (
                          <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                            <FormErrorIcon size="sm" animation="pulse" />
                            <span>{form.formState.errors.firstName.message}</span>
                          </div>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control as any}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.lastName && (
                          <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                            <FormErrorIcon size="sm" animation="pulse" />
                            <span>{form.formState.errors.lastName.message}</span>
                          </div>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.email && (
                        <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                          <FormErrorIcon size="sm" animation="pulse" />
                          <span>{form.formState.errors.email.message}</span>
                        </div>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.phone && (
                        <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                          <FormErrorIcon size="sm" animation="pulse" />
                          <span>{form.formState.errors.phone.message}</span>
                        </div>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <Controller
                control={control as any}
                name="address1"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <AddressAutocompleteInput
                      id="shippingAddress1"
                      label="Address Line 1 (Street or P.O. Box)"
                      value={field.value}
                      onChange={field.onChange}
                      onAddressSelect={(details: AddressDetails) => {
                        setFormValue('address1', details.address1, { shouldValidate: true });
                        setFormValue('city', details.city, { shouldValidate: true });
                        setFormValue('region', details.region, { shouldValidate: true });
                        setFormValue('zip', details.zip, { shouldValidate: true });
                        setFormValue('country', details.country, { shouldValidate: true });
                      }}
                      placeholder="Start typing your street address..."
                      error={error?.message}
                      ref={field.ref}
                    />
                    <FormMessage>
                      {form.formState.errors.address1 && (
                        <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                          <FormErrorIcon size="sm" animation="pulse" />
                          <span>{form.formState.errors.address1.message}</span>
                        </div>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={control as any}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Apartment, suite, etc. - Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 123" {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.address2 && (
                        <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                          <FormErrorIcon size="sm" animation="pulse" />
                          <span>{form.formState.errors.address2.message}</span>
                        </div>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control as any}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Anytown" {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.city && (
                          <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                            <FormErrorIcon size="sm" animation="pulse" />
                            <span>{form.formState.errors.city.message}</span>
                          </div>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control as any}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.region && (
                          <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                            <FormErrorIcon size="sm" animation="pulse" />
                            <span>{form.formState.errors.region.message}</span>
                          </div>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control as any}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal / ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="90210" {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.zip && (
                          <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                            <FormErrorIcon size="sm" animation="pulse" />
                            <span>{form.formState.errors.zip.message}</span>
                          </div>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control as any}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="USA" {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.country && (
                        <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                          <FormErrorIcon size="sm" animation="pulse" />
                          <span>{form.formState.errors.country.message}</span>
                        </div>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
              
              <FormField
                control={control as any}
                name="sameAsBilling"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Use this address for billing
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {!form.watch('sameAsBilling') && (
                <>
                  <Separator className="my-6" />
                  <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control as any}
                      name="billingAddress.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.billingAddress?.firstName && (
                              <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                                <FormErrorIcon size="sm" animation="pulse" />
                                <span>{form.formState.errors.billingAddress.firstName.message}</span>
                              </div>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control as any}
                      name="billingAddress.lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.billingAddress?.lastName && (
                              <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                                <FormErrorIcon size="sm" animation="pulse" />
                                <span>{form.formState.errors.billingAddress.lastName.message}</span>
                              </div>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Controller
                    control={control as any}
                    name="billingAddress.address1"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <AddressAutocompleteInput
                          id="billingAddress1"
                          label="Address Line 1 (Street or P.O. Box)"
                          value={field.value || ''} 
                          onChange={field.onChange}
                          onAddressSelect={(details: AddressDetails) => {
                            setFormValue('billingAddress.address1', details.address1, { shouldValidate: true });
                            setFormValue('billingAddress.city', details.city, { shouldValidate: true });
                            setFormValue('billingAddress.region', details.region, { shouldValidate: true });
                            setFormValue('billingAddress.zip', details.zip, { shouldValidate: true });
                            setFormValue('billingAddress.country', details.country, { shouldValidate: true });
                          }}
                          placeholder="Start typing your street address..."
                          error={error?.message}
                          ref={field.ref}
                        />
                        <FormMessage>
                          {form.formState.errors.billingAddress?.address1 && (
                            <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                              <FormErrorIcon size="sm" animation="pulse" />
                              <span>{form.formState.errors.billingAddress.address1.message}</span>
                            </div>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control as any}
                    name="billingAddress.address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Apartment, suite, etc. - Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apt 123" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.billingAddress?.address2 && (
                            <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                              <FormErrorIcon size="sm" animation="pulse" />
                              <span>{form.formState.errors.billingAddress.address2.message}</span>
                            </div>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={control as any}
                      name="billingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Anytown" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.billingAddress?.city && (
                              <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                                <FormErrorIcon size="sm" animation="pulse" />
                                <span>{form.formState.errors.billingAddress.city.message}</span>
                              </div>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control as any}
                      name="billingAddress.region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.billingAddress?.region && (
                              <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                                <FormErrorIcon size="sm" animation="pulse" />
                                <span>{form.formState.errors.billingAddress.region.message}</span>
                              </div>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control as any}
                      name="billingAddress.zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal / ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="90210" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.billingAddress?.zip && (
                              <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                                <FormErrorIcon size="sm" animation="pulse" />
                                <span>{form.formState.errors.billingAddress.zip.message}</span>
                              </div>
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={control as any}
                    name="billingAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="USA" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.billingAddress?.country && (
                            <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                              <FormErrorIcon size="sm" animation="pulse" />
                              <span>{form.formState.errors.billingAddress.country.message}</span>
                            </div>
                          )}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={goToNextStep}>
                Continue to Shipping Method <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case CheckoutStep.ShippingMethod:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Shipping Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRates ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <p>Calculating shipping rates...</p>
                </div>
              ) : shippingError ? (
                <div className="text-center p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                  <p className="text-destructive">{shippingError}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={fetchShippingRates}
                  >
                    Retry
                  </Button>
                </div>
              ) : shippingOptions.length === 0 ? (
                <div className="text-center p-4">
                  <p>No shipping options available for the provided address.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={goToPreviousStep}
                  >
                    Update Address
                  </Button>
                </div>
              ) : (
                <RadioGroup 
                  value={selectedShippingMethod?.toString() || ''} 
                  onValueChange={handleShippingMethodSelect}
                  className="space-y-3"
                >
                  {shippingOptions.map((option) => (
                    <div key={option.method_id} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option.method_id.toString()} 
                        id={`shipping-${option.method_id}`}
                      />
                      <label 
                        htmlFor={`shipping-${option.method_id}`}
                        className="flex flex-1 justify-between cursor-pointer p-3 rounded-md border border-transparent hover:bg-accent"
                      >
                        <div>
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(option as any).min_delivery_days && (option as any).max_delivery_days
                              ? `Estimated delivery: ${(option as any).min_delivery_days}-${(option as any).max_delivery_days} days`
                              : 'Delivery time varies'}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(option.price)}</p>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={goToNextStep} 
                disabled={isLoadingRates || !selectedShippingMethod}
              >
                Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case CheckoutStep.Payment:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitting ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <p>Processing your order...</p>
                </div>
              ) : (
                <MockCheckoutForm
                  key={internalOrderId}
                  orderId={internalOrderId}
                  userId="user_placeholder" // Replace with actual user ID from authentication
                  amount={totalPrice}
                  currency="USD"
                  portraitIds={items.filter(i => i.customization?.portraitId).map(i => i.customization?.portraitId as string)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}

              {paymentError && (
                <div className="mt-4 p-3 border border-destructive/20 rounded-lg bg-destructive/10">
                  <p className="text-sm text-destructive">{paymentError}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-start">
              <Button variant="outline" onClick={goToPreviousStep} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };
  
  // Wrap the renderStepContent function to catch errors
  const renderStepContentWithErrorBoundary = () => {
    return (
      <ErrorBoundary
        onError={(error) => {
          console.error('Error in checkout process:', error);
          toast({
            title: 'Unexpected Error',
            description: 'An unexpected error occurred. We apologize for the inconvenience.',
            variant: 'destructive',
          });
        }}
        resetKeys={[currentStep]}
      >
        {renderStepContent()}
      </ErrorBoundary>
    );
  };
  
  // Create a separate component to render the form persistence notification
  const FormPersistenceNotification = () => {
    if (hasData && currentStep === CheckoutStep.ShippingAddress) {
      return (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-sm">
          <p className="flex items-center">
            <InfoIcon className="h-4 w-4 mr-2" />
            Your form data has been restored from your last session.
            <Button 
              variant="link" 
              size="sm"
              className="ml-2 h-auto p-0 text-blue-700"
              onClick={clearFormData}
            >
              Clear saved data
            </Button>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Form {...form}>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {Object.values(CheckoutStep).filter(step => typeof step === 'number').map((step) => (
            <div 
              key={step} 
              className={`flex flex-col items-center flex-1 ${Number(step) < currentStep ? 'text-primary' : Number(step) === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              <div 
                className={`rounded-full flex items-center justify-center w-8 h-8 mb-2 ${
                  Number(step) < currentStep ? 'bg-primary text-primary-foreground' : 
                  Number(step) === currentStep ? 'border-2 border-primary text-primary' :
                  'border border-muted text-muted-foreground'
                }`}
              >
                {Number(step) < currentStep ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step + 1
                )}
              </div>
              <span className="hidden md:block text-sm">
                {step === CheckoutStep.ReviewCart ? 'Cart' : 
                 step === CheckoutStep.ShippingAddress ? 'Address' :
                 step === CheckoutStep.ShippingMethod ? 'Shipping' : 'Payment'}
              </span>
            </div>
          ))}
        </div>
        <Progress value={progress} />
      </div>
      
      {renderCheckoutContent()}
      {hasData && <FormPersistenceNotification />}
    </Form>
  );
} 