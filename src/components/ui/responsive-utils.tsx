import React from "react";
import { cn } from "@/lib/utils";

// Types of visibility (shown at specific breakpoints)
type VisibilityBreakpoint = "always" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface HiddenProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Hide at these breakpoints (inclusive)
   */
  below?: VisibilityBreakpoint;
  /**
   * Hide at these breakpoints (inclusive)
   */
  above?: VisibilityBreakpoint;
  /**
   * Hide only at these exact breakpoints
   */
  at?: VisibilityBreakpoint | VisibilityBreakpoint[];
  /**
   * Element to render as
   */
  as?: React.ElementType;
}

/**
 * Hidden component - conditionally hides content at specified breakpoints
 */
export function Hidden({
  children,
  className = "",
  below,
  above,
  at,
  as: Component = "div",
  ...props
}: HiddenProps) {
  const getHiddenClasses = () => {
    const classes: string[] = [];
    
    // Handle "below" prop
    if (below) {
      switch (below) {
        case "xs":
          // Not applicable as xs is the smallest breakpoint
          break;
        case "sm":
          classes.push("sm:hidden");
          break;
        case "md":
          classes.push("md:hidden");
          break;
        case "lg":
          classes.push("lg:hidden");
          break;
        case "xl":
          classes.push("xl:hidden");
          break;
        case "2xl":
          classes.push("2xl:hidden");
          break;
        case "always":
          classes.push("hidden");
          break;
      }
    }
    
    // Handle "above" prop
    if (above) {
      switch (above) {
        case "xs":
          classes.push("hidden sm:block");
          break;
        case "sm":
          classes.push("hidden md:block");
          break;
        case "md":
          classes.push("hidden lg:block");
          break;
        case "lg":
          classes.push("hidden xl:block");
          break;
        case "xl":
          classes.push("hidden 2xl:block");
          break;
        case "2xl":
          classes.push("hidden");
          break;
        case "always":
          // Not applicable
          break;
      }
    }
    
    // Handle "at" prop
    if (at) {
      const breakpoints = Array.isArray(at) ? at : [at];
      
      breakpoints.forEach(breakpoint => {
        switch (breakpoint) {
          case "xs":
            classes.push("hidden sm:block");
            classes.push("sm:hidden md:block");
            break;
          case "sm":
            classes.push("block sm:hidden md:block");
            break;
          case "md":
            classes.push("block md:hidden lg:block");
            break;
          case "lg":
            classes.push("block lg:hidden xl:block");
            break;
          case "xl":
            classes.push("block xl:hidden 2xl:block");
            break;
          case "2xl":
            classes.push("block 2xl:hidden");
            break;
          case "always":
            classes.push("hidden");
            break;
        }
      });
    }
    
    return classes.join(" ");
  };
  
  return (
    <Component
      className={cn(getHiddenClasses(), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

interface VisibleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Show only at these breakpoints (inclusive)
   */
  below?: VisibilityBreakpoint;
  /**
   * Show only at these breakpoints (inclusive)
   */
  above?: VisibilityBreakpoint;
  /**
   * Show only at these exact breakpoints
   */
  at?: VisibilityBreakpoint | VisibilityBreakpoint[];
  /**
   * Element to render as
   */
  as?: React.ElementType;
}

/**
 * Visible component - conditionally shows content at specified breakpoints
 */
export function Visible({
  children,
  className = "",
  below,
  above,
  at,
  as: Component = "div",
  ...props
}: VisibleProps) {
  const getVisibleClasses = () => {
    const classes: string[] = [];
    
    // Handle "below" prop - show only below specific breakpoint
    if (below) {
      switch (below) {
        case "xs":
          // Not applicable as xs is the smallest breakpoint
          break;
        case "sm":
          classes.push("sm:hidden");
          break;
        case "md":
          classes.push("block md:hidden");
          break;
        case "lg":
          classes.push("block lg:hidden");
          break;
        case "xl":
          classes.push("block xl:hidden");
          break;
        case "2xl":
          classes.push("block 2xl:hidden");
          break;
        case "always":
          classes.push("block");
          break;
      }
    }
    
    // Handle "above" prop - show only above specific breakpoint
    if (above) {
      switch (above) {
        case "xs":
          classes.push("hidden sm:block");
          break;
        case "sm":
          classes.push("hidden md:block");
          break;
        case "md":
          classes.push("hidden lg:block");
          break;
        case "lg":
          classes.push("hidden xl:block");
          break;
        case "xl":
          classes.push("hidden 2xl:block");
          break;
        case "2xl":
          // Not applicable as 2xl is the largest breakpoint
          break;
        case "always":
          classes.push("block");
          break;
      }
    }
    
    // Handle "at" prop - show only at specific breakpoints
    if (at) {
      const breakpoints = Array.isArray(at) ? at : [at];
      
      if (breakpoints.includes("always")) {
        classes.push("block");
      } else if (breakpoints.includes("xs")) {
        classes.push("block sm:hidden");
      } else {
        classes.push("hidden");
      }
      
      if (breakpoints.includes("sm")) {
        classes.push("sm:block md:hidden");
      }
      
      if (breakpoints.includes("md")) {
        classes.push("md:block lg:hidden");
      }
      
      if (breakpoints.includes("lg")) {
        classes.push("lg:block xl:hidden");
      }
      
      if (breakpoints.includes("xl")) {
        classes.push("xl:block 2xl:hidden");
      }
      
      if (breakpoints.includes("2xl")) {
        classes.push("2xl:block");
      }
    }
    
    return classes.join(" ");
  };
  
  return (
    <Component
      className={cn(getVisibleClasses(), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Spacing utilities
export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size at different breakpoints
   */
  size?: number | {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  /**
   * Direction (horizontal or vertical)
   */
  direction?: "vertical" | "horizontal";
}

/**
 * Spacer component - adds responsive spacing
 */
export function Spacer({
  className = "",
  size = 4,
  direction = "vertical",
  ...props
}: SpacerProps) {
  const getSpacerClasses = () => {
    const classes: string[] = [];
    const isHorizontal = direction === "horizontal";
    
    // Handle responsive size object
    if (typeof size === "object") {
      // Default size
      if (size.default !== undefined) {
        classes.push(isHorizontal ? `mr-${size.default}` : `mb-${size.default}`);
      }
      
      // Breakpoint-specific sizes
      if (size.sm !== undefined) {
        classes.push(isHorizontal ? `sm:mr-${size.sm}` : `sm:mb-${size.sm}`);
      }
      
      if (size.md !== undefined) {
        classes.push(isHorizontal ? `md:mr-${size.md}` : `md:mb-${size.md}`);
      }
      
      if (size.lg !== undefined) {
        classes.push(isHorizontal ? `lg:mr-${size.lg}` : `lg:mb-${size.lg}`);
      }
      
      if (size.xl !== undefined) {
        classes.push(isHorizontal ? `xl:mr-${size.xl}` : `xl:mb-${size.xl}`);
      }
      
      if (size["2xl"] !== undefined) {
        classes.push(isHorizontal ? `2xl:mr-${size["2xl"]}` : `2xl:mb-${size["2xl"]}`);
      }
    } else {
      // Simple numeric size
      classes.push(isHorizontal ? `mr-${size}` : `mb-${size}`);
    }
    
    return classes.join(" ");
  };
  
  return (
    <div 
      className={cn(
        getSpacerClasses(),
        "inline-block",
        className
      )}
      {...props}
    />
  );
}

export default { Hidden, Visible, Spacer }; 