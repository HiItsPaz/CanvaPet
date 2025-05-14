import * as React from "react";
import { cn } from "@/lib/utils";

// Common responsive props pattern
type ResponsiveProps<T> = {
  default?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
};

// Row component props
export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Reverse direction on specific breakpoints
   */
  reverse?: boolean | ResponsiveProps<boolean>;
  /**
   * Horizontal alignment of items
   */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly" | ResponsiveProps<"start" | "center" | "end" | "between" | "around" | "evenly">;
  /**
   * Vertical alignment of items
   */
  align?: "start" | "center" | "end" | "stretch" | "baseline" | ResponsiveProps<"start" | "center" | "end" | "stretch" | "baseline">;
  /**
   * Control how items wrap
   */
  wrap?: boolean | "reverse" | ResponsiveProps<boolean | "reverse">;
  /**
   * Gap between items
   */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | ResponsiveProps<"none" | "xs" | "sm" | "md" | "lg" | "xl">;
  /**
   * Conditionally render as a different element
   */
  as?: React.ElementType;
}

// Column component props
export interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width at different breakpoints (1-12 for fractions, or specific values)
   */
  width?: number | string | ResponsiveProps<number | string>;
  /**
   * Flex grow factor
   */
  grow?: boolean | number | ResponsiveProps<boolean | number>;
  /**
   * Flex shrink factor
   */
  shrink?: boolean | number | ResponsiveProps<boolean | number>;
  /**
   * Order of the column
   */
  order?: number | ResponsiveProps<number>;
  /**
   * Offset of the column (in grid columns)
   */
  offset?: number | ResponsiveProps<number>;
  /**
   * Conditionally render as a different element
   */
  as?: React.ElementType;
}

/**
 * Row component for flexbox-based layouts
 */
export function Row({
  children,
  className = "",
  reverse = false,
  justify = "start",
  align = "start",
  wrap = false,
  gap = "none",
  as: Component = "div",
  ...props
}: RowProps) {
  // Process responsive properties
  const processResponsiveProp = <T extends any>(
    prop: T | ResponsiveProps<T> | undefined,
    valueMap: (value: T, breakpoint: string) => string,
    defaultValue: string = ""
  ): string => {
    if (prop === undefined) return defaultValue;
    
    // If not responsive object, handle as single value
    if (typeof prop !== "object" || prop === null || Array.isArray(prop)) {
      return valueMap(prop as T, "default");
    }
    
    // Handle responsive object
    const responsiveObj = prop as ResponsiveProps<T>;
    const classes: string[] = [];
    
    if (responsiveObj.default !== undefined) 
      classes.push(valueMap(responsiveObj.default, "default"));
    if (responsiveObj.sm !== undefined) 
      classes.push(valueMap(responsiveObj.sm, "sm"));
    if (responsiveObj.md !== undefined) 
      classes.push(valueMap(responsiveObj.md, "md"));
    if (responsiveObj.lg !== undefined) 
      classes.push(valueMap(responsiveObj.lg, "lg"));
    if (responsiveObj.xl !== undefined) 
      classes.push(valueMap(responsiveObj.xl, "xl"));
    if (responsiveObj["2xl"] !== undefined) 
      classes.push(valueMap(responsiveObj["2xl"], "2xl"));
    
    return classes.join(" ");
  };
  
  // Direction classes
  const getDirectionClasses = () => {
    return processResponsiveProp<boolean | undefined>(
      reverse,
      (value, breakpoint) => {
        if (!value) return breakpoint === "default" ? "flex-row" : `${breakpoint}:flex-row`;
        return breakpoint === "default" ? "flex-row-reverse" : `${breakpoint}:flex-row-reverse`;
      },
      "flex-row"
    );
  };
  
  // Justify classes
  const getJustifyClasses = () => {
    return processResponsiveProp<"start" | "center" | "end" | "between" | "around" | "evenly" | undefined>(
      justify,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        switch (value) {
          case "start": return `${prefix}justify-start`;
          case "center": return `${prefix}justify-center`;
          case "end": return `${prefix}justify-end`;
          case "between": return `${prefix}justify-between`;
          case "around": return `${prefix}justify-around`;
          case "evenly": return `${prefix}justify-evenly`;
          default: return `${prefix}justify-start`;
        }
      },
      "justify-start"
    );
  };
  
  // Align classes
  const getAlignClasses = () => {
    return processResponsiveProp<"start" | "center" | "end" | "stretch" | "baseline" | undefined>(
      align,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        switch (value) {
          case "start": return `${prefix}items-start`;
          case "center": return `${prefix}items-center`;
          case "end": return `${prefix}items-end`;
          case "stretch": return `${prefix}items-stretch`;
          case "baseline": return `${prefix}items-baseline`;
          default: return `${prefix}items-start`;
        }
      },
      "items-start"
    );
  };
  
  // Wrap classes
  const getWrapClasses = () => {
    return processResponsiveProp<boolean | "reverse" | undefined>(
      wrap,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        if (value === false) return `${prefix}flex-nowrap`;
        if (value === "reverse") return `${prefix}flex-wrap-reverse`;
        return `${prefix}flex-wrap`;
      },
      "flex-nowrap"
    );
  };
  
  // Gap classes
  const getGapClasses = () => {
    return processResponsiveProp<"none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined>(
      gap,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        switch (value) {
          case "none": return `${prefix}gap-0`;
          case "xs": return `${prefix}gap-1`;
          case "sm": return `${prefix}gap-2`;
          case "md": return `${prefix}gap-4`;
          case "lg": return `${prefix}gap-6`;
          case "xl": return `${prefix}gap-8`;
          default: return `${prefix}gap-0`;
        }
      },
      "gap-0"
    );
  };

  return (
    <Component
      className={cn(
        "flex",
        getDirectionClasses(),
        getJustifyClasses(),
        getAlignClasses(),
        getWrapClasses(),
        getGapClasses(),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Column component for flexbox-based layouts
 */
export function Column({
  children,
  className = "",
  width,
  grow = false,
  shrink = true,
  order,
  offset,
  as: Component = "div",
  ...props
}: ColumnProps) {
  // Process responsive width
  const getWidthClasses = () => {
    return processResponsiveProp<number | string | undefined>(
      width,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        
        // Handle numeric width as fractions (12-column grid)
        if (typeof value === "number") {
          if (value >= 1 && value <= 12) {
            const fraction = Math.round(value) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
            const widthMap: Record<number, string> = {
              1: "w-1/12", 2: "w-2/12", 3: "w-3/12", 4: "w-4/12", 
              5: "w-5/12", 6: "w-6/12", 7: "w-7/12", 8: "w-8/12",
              9: "w-9/12", 10: "w-10/12", 11: "w-11/12", 12: "w-full",
            };
            return `${prefix}${widthMap[fraction]}`;
          }
          return `${prefix}w-full`; // Default to full width for invalid numbers
        }
        
        // Handle string width (e.g., "auto", "200px", "50%", etc.)
        if (typeof value === "string") {
          if (value === "auto") return `${prefix}w-auto`;
          if (value === "full") return `${prefix}w-full`;
          
          // For custom widths, we need to use inline style
          return ""; // Will be handled by inline style
        }
        
        return "";
      },
      ""
    );
  };
  
  // Process grow
  const getGrowClasses = () => {
    return processResponsiveProp<boolean | number | undefined>(
      grow,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        
        if (value === true) return `${prefix}flex-grow`;
        if (value === false) return `${prefix}flex-grow-0`;
        if (typeof value === "number") {
          // Tailwind doesn't support arbitrary grow values by default
          // For simplicity, we'll just use flex-grow
          return `${prefix}flex-grow`;
        }
        
        return `${prefix}flex-grow-0`;
      },
      "flex-grow-0"
    );
  };
  
  // Process shrink
  const getShrinkClasses = () => {
    return processResponsiveProp<boolean | number | undefined>(
      shrink,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        
        if (value === true) return `${prefix}flex-shrink`;
        if (value === false) return `${prefix}flex-shrink-0`;
        if (typeof value === "number") {
          // Tailwind doesn't support arbitrary shrink values by default
          // For simplicity, we'll just use flex-shrink
          return `${prefix}flex-shrink`;
        }
        
        return `${prefix}flex-shrink`;
      },
      "flex-shrink"
    );
  };
  
  // Process order
  const getOrderClasses = () => {
    return processResponsiveProp<number | undefined>(
      order,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        
        if (typeof value === "number") {
          if (value >= 1 && value <= 12) {
            return `${prefix}order-${value}`;
          }
          return `${prefix}order-none`;
        }
        
        return "";
      },
      ""
    );
  };
  
  // Process offset
  const getOffsetClasses = () => {
    return processResponsiveProp<number | undefined>(
      offset,
      (value, breakpoint) => {
        const prefix = breakpoint === "default" ? "" : `${breakpoint}:`;
        
        if (typeof value === "number") {
          if (value >= 1 && value <= 12) {
            return `${prefix}ml-${value}/12`;
          }
          return "";
        }
        
        return "";
      },
      ""
    );
  };
  
  // Helper function for responsive prop handling
  function processResponsiveProp<T>(
    prop: T | ResponsiveProps<T> | undefined,
    valueMap: (value: T, breakpoint: string) => string,
    defaultValue: string = ""
  ): string {
    if (prop === undefined) return defaultValue;
    
    // If not responsive object, handle as single value
    if (typeof prop !== "object" || prop === null || Array.isArray(prop)) {
      return valueMap(prop as T, "default");
    }
    
    // Handle responsive object
    const responsiveObj = prop as ResponsiveProps<T>;
    const classes: string[] = [];
    
    if (responsiveObj.default !== undefined) 
      classes.push(valueMap(responsiveObj.default, "default"));
    if (responsiveObj.sm !== undefined) 
      classes.push(valueMap(responsiveObj.sm, "sm"));
    if (responsiveObj.md !== undefined) 
      classes.push(valueMap(responsiveObj.md, "md"));
    if (responsiveObj.lg !== undefined) 
      classes.push(valueMap(responsiveObj.lg, "lg"));
    if (responsiveObj.xl !== undefined) 
      classes.push(valueMap(responsiveObj.xl, "xl"));
    if (responsiveObj["2xl"] !== undefined) 
      classes.push(valueMap(responsiveObj["2xl"], "2xl"));
    
    return classes.join(" ");
  }
  
  // Calculate inline styles for custom widths
  const getColumnStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    
    // Only add width style if it's a string that's not handled by Tailwind
    if (typeof width === "string" && width !== "auto" && width !== "full") {
      styles.width = width;
    }
    
    return styles;
  };

  return (
    <Component
      className={cn(
        getWidthClasses(),
        getGrowClasses(),
        getShrinkClasses(),
        getOrderClasses(),
        getOffsetClasses(),
        className
      )}
      style={getColumnStyles()}
      {...props}
    >
      {children}
    </Component>
  );
}

export default { Row, Column }; 