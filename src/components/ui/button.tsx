"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"
import type { IconProps } from "@/components/ui/icon"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:bg-accent/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Icon to display at the start of the button */
  startIcon?: React.ReactNode
  /** Icon to display at the end of the button */
  endIcon?: React.ReactNode
  /** Whether the button is in a loading state */
  isLoading?: boolean
  /** Text to display when the button is loading */
  loadingText?: string
  /** Icon props for the start icon (when using IconProps) */
  startIconProps?: Partial<IconProps> 
  /** Icon props for the end icon (when using IconProps) */
  endIconProps?: Partial<IconProps>
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    startIcon, 
    endIcon,
    isLoading = false,
    loadingText,
    startIconProps,
    endIconProps,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Handle different icon types - if it's a Lucide icon, wrap it in our Icon component
    const renderIcon = (iconProp: React.ReactNode, iconProps?: Partial<IconProps>) => {
      // If it's already a ReactNode (e.g., JSX element), return it as is
      if (React.isValidElement(iconProp)) {
        // If it's a Lucide icon, try to wrap it in our Icon component
        const iconName = (iconProp.type as any)?.displayName
        if (typeof iconName === 'string' && iconName.includes('Lucide')) {
          return <Icon icon={iconProp.type as any} size="sm" decorative {...iconProps} />
        }
        return iconProp
      }
      return iconProp
    }
    
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isLoading || props.disabled}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <Icon 
            icon={Loader2} 
            size="sm" 
            className="animate-spin" 
            decorative 
          />
        )}
        {!isLoading && startIcon && renderIcon(startIcon, startIconProps)}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && endIcon && renderIcon(endIcon, endIconProps)}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
