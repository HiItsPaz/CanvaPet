import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Container sizes with their max-width values
 */
export type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "fluid" | ResponsiveSize;

/**
 * Responsive container size configuration
 */
type ResponsiveSize = {
  default?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "fluid";
  sm?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "fluid";
  md?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "fluid";
  lg?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "fluid";
  xl?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "fluid";
  "2xl"?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "fluid";
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container size/max-width at different breakpoints
   */
  size?: ContainerSize;
  /**
   * Whether to center the container horizontally
   */
  centered?: boolean;
  /**
   * Horizontal padding size
   */
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Conditionally render as a different element
   */
  as?: React.ElementType;
}

/**
 * Container component for responsive layouts
 */
export function Container({
  children,
  className = "",
  size = "lg",
  centered = true,
  padding = "md",
  as: Component = "div",
  ...props
}: ContainerProps) {
  // Size classes mapping
  const sizeClasses = {
    xs: "max-w-screen-xs",
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
    fluid: "max-w-none",
  };
  
  // Padding classes mapping
  const paddingClasses = {
    none: "px-0",
    xs: "px-2",
    sm: "px-4",
    md: "px-6",
    lg: "px-8",
    xl: "px-12",
  };
  
  // Process responsive size
  const getSizeClasses = () => {
    // Handle simple string size
    if (typeof size === "string") {
      return sizeClasses[size as keyof typeof sizeClasses];
    }
    
    // Handle responsive object
    if (typeof size === "object" && size !== null) {
      const responsiveObj = size as ResponsiveSize;
      const classes: string[] = [];
      
      if (responsiveObj.default) 
        classes.push(sizeClasses[responsiveObj.default]);
      if (responsiveObj.sm) 
        classes.push(`sm:${sizeClasses[responsiveObj.sm]}`);
      if (responsiveObj.md) 
        classes.push(`md:${sizeClasses[responsiveObj.md]}`);
      if (responsiveObj.lg) 
        classes.push(`lg:${sizeClasses[responsiveObj.lg]}`);
      if (responsiveObj.xl) 
        classes.push(`xl:${sizeClasses[responsiveObj.xl]}`);
      if (responsiveObj["2xl"]) 
        classes.push(`2xl:${sizeClasses[responsiveObj["2xl"]]}`);
      
      return classes.join(" ");
    }
    
    // Default fallback
    return sizeClasses.lg;
  };

  return (
    <Component
      className={cn(
        getSizeClasses(),
        paddingClasses[padding],
        centered && "mx-auto",
        "w-full",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Container; 