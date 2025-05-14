"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";

interface CartIconProps {
  size?: "default" | "sm" | "lg";
  variant?: "ghost" | "outline" | "default";
  className?: string;
  onClick?: () => void;
}

export function CartIcon({
  size = "default",
  variant = "ghost",
  className,
  onClick,
}: CartIconProps) {
  const itemCount = useCartStore((state) => state.getTotalItems());
  
  return (
    <Button 
      variant={variant} 
      size={size === "default" ? "icon" : size === "sm" ? "sm" : "lg"}
      className={cn("relative", className)}
      onClick={onClick}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className={cn(
        "h-5 w-5",
        size === "sm" && "h-4 w-4",
        size === "lg" && "h-6 w-6"
      )} />
      
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className={cn(
            "absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] font-bold",
            size === "sm" && "h-4 w-4 -top-1 -right-1",
            size === "lg" && "h-6 w-6 -top-2 -right-2 text-xs"
          )}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </Button>
  );
} 