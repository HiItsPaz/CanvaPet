'use client';

import { useMemo } from 'react';
import { useCartStore, CartItem } from '@/stores/cart';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Info, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrderSummaryProps {
  className?: string;
  showItems?: boolean;
  collapsible?: boolean;
  shippingCost?: number;
  selectedShippingMethod?: number | null;
  editable?: boolean;
  compact?: boolean;
  sticky?: boolean;
}

export function OrderSummary({
  className,
  showItems = true,
  collapsible = false,
  shippingCost = 0,
  selectedShippingMethod = null,
  editable = false,
  compact = false,
  sticky = false
}: OrderSummaryProps) {
  const { items, getTotalPrice } = useCartStore();
  
  // Format currency for display
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(amount);
  };
  
  // Calculate total
  const totalItemsPrice = useMemo(() => getTotalPrice(), [items, getTotalPrice]);
  const totalPrice = useMemo(() => totalItemsPrice + shippingCost, [totalItemsPrice, shippingCost]);

  if (items.length === 0) {
    return null;
  }
  
  return (
    <Card className={cn(
      'overflow-hidden',
      sticky && 'lg:sticky lg:top-4',
      className
    )}>
      <CardHeader className={compact ? 'p-4' : undefined}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="h-5 w-5" /> Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && 'p-4 pt-0')}>
        {showItems && (
          <>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                <div className="flex gap-3">
                  {item.image && (
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {Object.entries(item.options || {}).map(([key, value]) => 
                        `${key}: ${value}`
                      ).join(', ')}
                    </p>
                    {item.customization && (
                      <Badge variant="outline" className="mt-1">Customized</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
            <Separator className="my-2" />
          </>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(totalItemsPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Shipping
              {!selectedShippingMethod && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-sm">Shipping cost will be calculated after you provide your shipping address.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
            <span>{selectedShippingMethod ? formatCurrency(shippingCost) : 'Calculated at next step'}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
      {editable && (
        <CardFooter className="bg-muted/50 p-4 flex justify-center">
          <a href="/merch" className="text-sm text-primary hover:underline">
            Edit cart
          </a>
        </CardFooter>
      )}
    </Card>
  );
} 