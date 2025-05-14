"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
  helper?: string
  error?: string
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, helper, error, indeterminate, id, ...props }, ref) => {
  const generatedId = React.useId()
  const checkboxId = id || generatedId
  
  // Set indeterminate state via effect
  React.useEffect(() => {
    if (!ref || !indeterminate) return;
    
    // For function refs, we can't do anything here
    if (typeof ref === 'function') return;
    
    // For object refs, we can set the indeterminate property
    const node = ref.current;
    if (node && 'indeterminate' in node) {
      (node as any).indeterminate = indeterminate;
    }
  }, [ref, indeterminate]);
  
  return (
    <div className="space-y-2">
      <div className="flex items-start">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            error && "border-destructive",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${checkboxId}-error` : helper ? `${checkboxId}-helper` : undefined
          }
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
          >
            {indeterminate ? <Minus className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label
            htmlFor={checkboxId}
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
      {error ? (
        <p id={`${checkboxId}-error`} className="text-sm text-destructive">{error}</p>
      ) : helper ? (
        <p id={`${checkboxId}-helper`} className="text-sm text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox } 