"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

// Add accessibility description for screen readers
const accessibilityDescription = {
  open: "Press Enter to open the dropdown, then use arrow keys to navigate options. Press Enter to select an option, or Escape to close without selecting.",
  closed: "Press Enter or Space to open the dropdown menu."
};

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    ariaLabel?: string;
  }
>(({ className, children, ariaLabel, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Update state based on select open/close
  const handleStateChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  return (
    <>
      {/* Hidden description for screen readers */}
      <span id={`select-instructions-${props.id || Math.random().toString(36).substr(2, 9)}`} className="sr-only">
        {isOpen ? accessibilityDescription.open : accessibilityDescription.closed}
      </span>
      
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          "data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2", // Visual feedback when open
          className
        )}
        aria-label={ariaLabel}
        aria-describedby={`select-instructions-${props.id || Math.random().toString(36).substr(2, 9)}`}
        onPointerDown={(e) => {
          // Ensure dropdown can be opened by screen reader click events
          if (e.pointerType === 'mouse') {
            e.preventDefault();
          }
        }}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50 transition-transform" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      
      {/* Context provider to track dropdown state */}
      <SelectStateProvider isOpen={isOpen} onOpenChange={handleStateChange} />
    </>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// Context to track select state
const SelectStateContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

// Provider component
const SelectStateProvider: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  React.useEffect(() => {
    // Listen for Radix UI select open/close events
    const handleOpenChange = (event: CustomEvent<{ open: boolean }>) => {
      if (event.detail) {
        onOpenChange(event.detail.open);
      }
    };
    
    document.addEventListener('selectOpenChange' as any, handleOpenChange);
    
    return () => {
      document.removeEventListener('selectOpenChange' as any, handleOpenChange);
    };
  }, [onOpenChange]);
  
  return null;
};

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" aria-hidden="true" />
    <span className="sr-only">Scroll up</span>
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" aria-hidden="true" />
    <span className="sr-only">Scroll down</span>
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

// Type for the Radix Select events
type SelectContentEvent = React.FocusEvent<HTMLDivElement>;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      onCloseAutoFocus={(event) => {
        // Ensure focus returns to trigger on close
        if (props.onCloseAutoFocus) {
          props.onCloseAutoFocus(event);
        }
        // Dispatch custom event for state tracking
        document.dispatchEvent(
          new CustomEvent('selectOpenChange', { 
            detail: { open: false } 
          })
        );
      }}
      // React to opening events
      onEscapeKeyDown={(event) => {
        if (props.onEscapeKeyDown) {
          props.onEscapeKeyDown(event);
        }
        // Notify that the select is closing
        document.dispatchEvent(
          new CustomEvent('selectOpenChange', { 
            detail: { open: false } 
          })
        );
      }}
      // Track when the select content appears
      onPointerDownOutside={(event) => {
        if (props.onPointerDownOutside) {
          props.onPointerDownOutside(event);
        }
        document.dispatchEvent(
          new CustomEvent('selectOpenChange', { 
            detail: { open: false } 
          })
        );
      }}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    itemDescription?: string;
  }
>(({ className, children, itemDescription, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground", // Highlight for keyboard navigation
      "data-[state=checked]:font-medium data-[state=checked]:bg-accent/20", // Visual indicator of selection
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    
    {/* Optional description for complex items */}
    {itemDescription && (
      <span className="sr-only">{itemDescription}</span>
    )}
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}; 