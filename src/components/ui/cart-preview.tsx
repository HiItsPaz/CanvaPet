"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/stores/cart";
import { CartIcon } from "@/components/ui/cart-icon";
import { X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartPreviewProps {
  triggerClassName?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  type?: "popover" | "dropdown";
}

export function CartPreview({
  triggerClassName,
  contentClassName,
  align = "end",
  type = "popover"
}: CartPreviewProps) {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const removeItem = useCartStore((state) => state.removeItem);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const renderContent = () => (
    <div className="flex flex-col w-full max-w-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="font-medium">Shopping Cart</h3>
        <span className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>
      
      <Separator />
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Your cart is empty</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/merch">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <ScrollArea className="max-h-[280px]">
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="py-3 px-4">
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {Object.entries(item.options).map(([key, value]) => (
                          <p key={key} className="text-xs text-muted-foreground">
                            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                          </p>
                        ))}
                      </div>
                      {item.customization.portraitId && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
                            Customized
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-medium">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
          
          <Separator />
          
          <div className="p-4">
            <div className="flex items-center justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Shipping and taxes calculated at checkout
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/checkout">View Cart</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
  
  if (type === "popover") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className={triggerClassName}>
            <CartIcon />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          align={align} 
          className={cn("w-96 p-0", contentClassName)}
          sideOffset={8}
        >
          {renderContent()}
        </PopoverContent>
      </Popover>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={triggerClassName}>
          <CartIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className={cn("w-96 p-0", contentClassName)}
        sideOffset={8}
      >
        {renderContent()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 