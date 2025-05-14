import * as React from "react";
import { cn } from "@/lib/utils";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns at different breakpoints
   * Can be explicit number (grid-cols-{n}) or "auto-fit"/"auto-fill" for responsive grids
   */
  columns?: {
    default?: number | "auto-fit" | "auto-fill";
    sm?: number | "auto-fit" | "auto-fill";
    md?: number | "auto-fit" | "auto-fill";
    lg?: number | "auto-fit" | "auto-fill";
    xl?: number | "auto-fit" | "auto-fill";
    "2xl"?: number | "auto-fit" | "auto-fill";
  };
  /**
   * Gap between grid items
   */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Minimum column width for auto-fit/auto-fill columns
   */
  minColWidth?: string;
  /**
   * Maximum column width for auto-fit/auto-fill columns
   */
  maxColWidth?: string;
  /**
   * Gap between rows
   */
  rowGap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Grid areas template
   */
  areas?: string;
  /**
   * Container for conditional rendering
   */
  as?: React.ElementType;
}

export function Grid({
  children,
  className = "",
  columns = { default: 1, md: 2, lg: 3 },
  gap = "md",
  rowGap,
  minColWidth = "200px",
  maxColWidth = "1fr",
  areas,
  as: Component = "div",
  ...props
}: GridProps) {
  // Convert columns to grid-template-columns utility classes
  const getColumnClasses = () => {
    const classes = [];
    
    // Helper function to handle auto-fit/auto-fill
    const getColumnClass = (size: string, value: number | string | undefined) => {
      if (value === undefined) return "";
      
      // Handle auto-fit/auto-fill
      if (typeof value === "string") {
        // For auto-fit/auto-fill, we'll need to use inline style
        return "";
      }
      
      // For numeric values, use Tailwind classes
      const prefix = size === "default" ? "" : `${size}:`;
      return `${prefix}grid-cols-${value}`;
    };
    
    // Add classes for each breakpoint
    if (columns.default) classes.push(getColumnClass("default", columns.default));
    if (columns.sm) classes.push(getColumnClass("sm", columns.sm));
    if (columns.md) classes.push(getColumnClass("md", columns.md));
    if (columns.lg) classes.push(getColumnClass("lg", columns.lg));
    if (columns.xl) classes.push(getColumnClass("xl", columns.xl));
    if (columns["2xl"]) classes.push(getColumnClass("2xl", columns["2xl"]));
    
    return classes.join(" ");
  };

  // Gap classes
  const gapClasses = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };
  
  // Row gap classes (if different from column gap)
  const rowGapClasses = rowGap ? {
    none: "gap-y-0",
    xs: "gap-y-1",
    sm: "gap-y-2",
    md: "gap-y-4",
    lg: "gap-y-6",
    xl: "gap-y-8",
  } : {};

  // Calculate inline styles for auto-fit/auto-fill
  const getGridStyles = () => {
    const styles: React.CSSProperties = {};
    
    // Set up grid areas if provided
    if (areas) {
      styles.gridTemplateAreas = areas;
    }
    
    // Handle auto-fit/auto-fill columns at different breakpoints
    const hasAutoColumns = Object.values(columns).some(
      value => value === "auto-fit" || value === "auto-fill"
    );
    
    // If any breakpoint uses auto-fit/auto-fill, set up the base style
    if (hasAutoColumns) {
      // Default (smallest screens)
      if (columns.default === "auto-fit" || columns.default === "auto-fill") {
        styles.gridTemplateColumns = `repeat(${columns.default}, minmax(${minColWidth}, ${maxColWidth}))`;
      }
      
      // We're using inline styles directly, but in a real-world application,
      // you might want to use a CSS-in-JS solution or generate classes for each breakpoint
      // This approach works but has limitations in how it handles breakpoints via inline styles
    }
    
    return styles;
  };

  return (
    <Component
      className={cn(
        "grid",
        getColumnClasses(),
        gapClasses[gap],
        rowGap && rowGapClasses[rowGap],
        className
      )}
      style={getGridStyles()}
      {...props}
    >
      {children}
    </Component>
  );
}

// Named grid area component
export interface GridAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  area?: string;
  colSpan?: number;
  rowSpan?: number;
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
}

export function GridArea({
  children,
  className = "",
  area,
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  ...props
}: GridAreaProps) {
  // Calculate grid item styles
  const getGridItemStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (area) {
      styles.gridArea = area;
    }
    
    if (colSpan) {
      styles.gridColumn = `span ${colSpan}`;
    }
    
    if (rowSpan) {
      styles.gridRow = `span ${rowSpan}`;
    }
    
    if (colStart) {
      styles.gridColumnStart = colStart;
    }
    
    if (colEnd) {
      styles.gridColumnEnd = colEnd;
    }
    
    if (rowStart) {
      styles.gridRowStart = rowStart;
    }
    
    if (rowEnd) {
      styles.gridRowEnd = rowEnd;
    }
    
    return styles;
  };

  return (
    <div
      className={cn(className)}
      style={getGridItemStyles()}
      {...props}
    >
      {children}
    </div>
  );
}

// Export both components
export default { Grid, GridArea }; 