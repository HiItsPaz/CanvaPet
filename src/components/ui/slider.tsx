"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface EnhancedSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ariaLabel?: string;
  ariaValueText?: string | ((value: number) => string);
  formatValue?: (value: number) => string;
  stepText?: string;
}

/**
 * Enhanced accessible slider component
 * - Improved keyboard support with Home/End keys
 * - ARIA attributes for screen readers
 * - Value formatting for better user experience
 * - Step description for assistive technologies
 * 
 * Keyboard controls:
 * - Left/Down Arrow: Decrease by step amount
 * - Right/Up Arrow: Increase by step amount
 * - Page Down: Decrease by larger amount
 * - Page Up: Increase by larger amount
 * - Home: Set to minimum value
 * - End: Set to maximum value
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  EnhancedSliderProps
>(({ 
  className, 
  ariaLabel, 
  ariaValueText, 
  formatValue,
  stepText,
  ...props 
}, ref) => {
  const [hasFocus, setHasFocus] = React.useState(false);
  
  // Calculate the value text for screen readers
  const getAriaValueText = (value: number): string => {
    if (typeof ariaValueText === 'function') {
      return ariaValueText(value);
    }
    if (typeof ariaValueText === 'string') {
      return ariaValueText;
    }
    if (formatValue) {
      return formatValue(value);
    }
    return `${value}`;
  };
  
  // Determine current value for ARIA attributes
  const currentValue = Array.isArray(props.value) ? props.value[0] : props.defaultValue ? props.defaultValue[0] : props.min || 0;
  
  // Create an ID for the hidden description
  const descriptionId = React.useId();
  
  // Enhanced keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Default Radix UI already handles arrow keys
    // We'll add support for Home/End keys
    const min = props.min || 0;
    const max = props.max || 100;
    const step = props.step || 1;
    
    // Get current values
    const values = Array.isArray(props.value) ? [...props.value] : 
                  props.defaultValue ? [...props.defaultValue] : [min];
    
    switch (e.key) {
      case 'Home':
        // Set to minimum value
        e.preventDefault();
        if (props.onValueChange) {
          values[0] = min;
          props.onValueChange(values);
        }
        break;
      case 'End':
        // Set to maximum value
        e.preventDefault();
        if (props.onValueChange) {
          values[0] = max;
          props.onValueChange(values);
        }
        break;
      case 'PageUp':
        // Increase by larger step (5x normal step)
        e.preventDefault();
        if (props.onValueChange) {
          const newValue = Math.min(values[0] + (step * 5), max);
          values[0] = newValue;
          props.onValueChange(values);
        }
        break;
      case 'PageDown':
        // Decrease by larger step (5x normal step)
        e.preventDefault();
        if (props.onValueChange) {
          const newValue = Math.max(values[0] - (step * 5), min);
          values[0] = newValue;
          props.onValueChange(values);
        }
        break;
    }
  };
  
  return (
    <div className="relative">
      {/* Hidden description for screen readers */}
      <div id={descriptionId} className="sr-only">
        {stepText || `Use arrow keys to adjust value by ${props.step || 1}. PageUp/PageDown for larger steps. Home for minimum, End for maximum.`}
      </div>
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          hasFocus && "z-10", // Increase z-index when focused
          className
        )}
        aria-label={ariaLabel}
        aria-valuetext={getAriaValueText(currentValue)}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        {...props}
      >
        <SliderPrimitive.Track 
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
          // Improve accessibility with ARIA roles
          aria-hidden="true"
        >
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb 
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            // Add data state styles for better keyboard focus indication
            "data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-offset-2"
          )}
          // Provide label for screen readers if not provided at root level
          aria-label={ariaLabel || "Slider value"}
        />
      </SliderPrimitive.Root>
      
      {/* Optional visible value display */}
      {formatValue && (
        <div className="absolute right-0 -top-6 text-sm text-muted-foreground" aria-hidden="true">
          {formatValue(currentValue)}
        </div>
      )}
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider } 