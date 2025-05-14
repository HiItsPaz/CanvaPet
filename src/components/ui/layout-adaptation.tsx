"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Types of breakpoints matching the system's design tokens
type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// Helper function to get current breakpoint from window width
function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "xs";
  
  const width = window.innerWidth;
  if (width < 640) return "xs";
  if (width < 768) return "sm";
  if (width < 1024) return "md";
  if (width < 1280) return "lg";
  if (width < 1536) return "xl";
  return "2xl";
}

// ============================
// Viewport Context & Provider
// ============================

interface ViewportContextType {
  currentBreakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

const ViewportContext = createContext<ViewportContextType>({
  currentBreakpoint: "xs",
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  width: 0,
  height: 0,
});

export function ViewportProvider({ children }: { children: React.ReactNode }) {
  const [viewport, setViewport] = useState<ViewportContextType>({
    currentBreakpoint: "xs",
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const currentBreakpoint = getCurrentBreakpoint();
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        currentBreakpoint,
        isMobile: currentBreakpoint === "xs" || currentBreakpoint === "sm",
        isTablet: currentBreakpoint === "md",
        isDesktop: 
          currentBreakpoint === "lg" || 
          currentBreakpoint === "xl" || 
          currentBreakpoint === "2xl",
        width,
        height,
      });
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  return useContext(ViewportContext);
}

// ============================
// LayoutShift Component
// ============================

type BreakpointOrderType = {
  [key in Breakpoint]?: number;
};

interface LayoutShiftProps extends React.HTMLAttributes<HTMLDivElement> {
  order?: BreakpointOrderType;
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * LayoutShift component - changes the visual order of an element at different breakpoints
 */
export function LayoutShift({
  children,
  className,
  order = {},
  as: Component = "div",
  ...props
}: LayoutShiftProps) {
  const getOrderClasses = () => {
    const classes: string[] = [];
    
    // Apply order for each breakpoint
    if (order.xs !== undefined) classes.push(`order-[${order.xs}]`);
    if (order.sm !== undefined) classes.push(`sm:order-[${order.sm}]`);
    if (order.md !== undefined) classes.push(`md:order-[${order.md}]`);
    if (order.lg !== undefined) classes.push(`lg:order-[${order.lg}]`);
    if (order.xl !== undefined) classes.push(`xl:order-[${order.xl}]`);
    if (order["2xl"] !== undefined) classes.push(`2xl:order-[${order["2xl"]}]`);
    
    return classes.join(" ");
  };
  
  return (
    <Component
      className={cn(getOrderClasses(), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================
// ContentAdaptation Hook
// ============================

interface ContentVariants<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
  default: T;
}

/**
 * useContentAdaptation hook - provides different content based on the current breakpoint
 */
export function useContentAdaptation<T>(variants: ContentVariants<T>): T {
  const { currentBreakpoint } = useViewport();
  
  // Return the content for the current breakpoint, falling back to more general breakpoints
  switch (currentBreakpoint) {
    case "2xl":
      return variants["2xl"] ?? variants.xl ?? variants.lg ?? variants.md ?? variants.sm ?? variants.xs ?? variants.default;
    case "xl":
      return variants.xl ?? variants.lg ?? variants.md ?? variants.sm ?? variants.xs ?? variants.default;
    case "lg":
      return variants.lg ?? variants.md ?? variants.sm ?? variants.xs ?? variants.default;
    case "md":
      return variants.md ?? variants.sm ?? variants.xs ?? variants.default;
    case "sm":
      return variants.sm ?? variants.xs ?? variants.default;
    case "xs":
      return variants.xs ?? variants.default;
    default:
      return variants.default;
  }
}

// ============================
// ScrollContainer Component
// ============================

interface ScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction to scroll at different breakpoints
   */
  direction?: {
    default?: "horizontal" | "vertical";
    sm?: "horizontal" | "vertical";
    md?: "horizontal" | "vertical";
    lg?: "horizontal" | "vertical";
    xl?: "horizontal" | "vertical";
    "2xl"?: "horizontal" | "vertical";
  };
  /**
   * Whether to show scrollbar
   */
  showScrollbar?: boolean;
  /**
   * Element to render as
   */
  as?: React.ElementType;
}

/**
 * ScrollContainer component - provides a container that changes scroll behavior at different breakpoints
 */
export function ScrollContainer({
  children,
  className = "",
  direction = { default: "horizontal" },
  showScrollbar = false,
  as: Component = "div",
  ...props
}: ScrollContainerProps) {
  const getScrollClasses = () => {
    const classes: string[] = [];
    
    // Base styles
    classes.push("overflow-auto");
    
    if (!showScrollbar) {
      classes.push("scrollbar-hide");
    }
    
    // Direction styles for each breakpoint
    if (direction.default === "horizontal") {
      classes.push("flex flex-row");
    } else if (direction.default === "vertical") {
      classes.push("flex flex-col");
    }
    
    if (direction.sm === "horizontal") {
      classes.push("sm:flex-row");
    } else if (direction.sm === "vertical") {
      classes.push("sm:flex-col");
    }
    
    if (direction.md === "horizontal") {
      classes.push("md:flex-row");
    } else if (direction.md === "vertical") {
      classes.push("md:flex-col");
    }
    
    if (direction.lg === "horizontal") {
      classes.push("lg:flex-row");
    } else if (direction.lg === "vertical") {
      classes.push("lg:flex-col");
    }
    
    if (direction.xl === "horizontal") {
      classes.push("xl:flex-row");
    } else if (direction.xl === "vertical") {
      classes.push("xl:flex-col");
    }
    
    if (direction["2xl"] === "horizontal") {
      classes.push("2xl:flex-row");
    } else if (direction["2xl"] === "vertical") {
      classes.push("2xl:flex-col");
    }
    
    return classes.join(" ");
  };
  
  return (
    <Component
      className={cn(getScrollClasses(), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================
// CollapseWrapper Component
// ============================

interface CollapseWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether content is collapsed at different breakpoints
   */
  collapsed?: {
    default?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
    "2xl"?: boolean;
  };
  /**
   * Summary/header to show when collapsed
   */
  summary: React.ReactNode;
  /**
   * Element to render as
   */
  as?: React.ElementType;
}

/**
 * CollapseWrapper component - collapses content at specified breakpoints
 */
export function CollapseWrapper({
  children,
  className = "",
  collapsed = { default: true, md: false },
  summary,
  as: Component = "div",
  ...props
}: CollapseWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentBreakpoint } = useViewport();
  
  // Determine if content should be collapsed based on current breakpoint
  const shouldBeCollapsed = () => {
    switch (currentBreakpoint) {
      case "2xl":
        return collapsed["2xl"] ?? collapsed.xl ?? collapsed.lg ?? collapsed.md ?? collapsed.sm ?? collapsed.default ?? false;
      case "xl":
        return collapsed.xl ?? collapsed.lg ?? collapsed.md ?? collapsed.sm ?? collapsed.default ?? false;
      case "lg":
        return collapsed.lg ?? collapsed.md ?? collapsed.sm ?? collapsed.default ?? false;
      case "md":
        return collapsed.md ?? collapsed.sm ?? collapsed.default ?? false;
      case "sm":
        return collapsed.sm ?? collapsed.default ?? false;
      case "xs":
      default:
        return collapsed.default ?? false;
    }
  };
  
  // Reset open state when breakpoint changes
  useEffect(() => {
    setIsOpen(!shouldBeCollapsed());
  }, [currentBreakpoint]);
  
  const isCollapsed = shouldBeCollapsed() && !isOpen;
  
  return (
    <Component
      className={cn(
        "border rounded-md overflow-hidden transition-all",
        isCollapsed ? "max-h-[56px]" : "max-h-[2000px]",
        className
      )}
      {...props}
    >
      <div 
        className="p-3 bg-muted/20 flex justify-between items-center cursor-pointer"
        onClick={() => shouldBeCollapsed() && setIsOpen(!isOpen)}
      >
        <div className="font-medium">{summary}</div>
        {shouldBeCollapsed() && (
          <button 
            className="text-sm px-2 py-1 rounded hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        )}
      </div>
      <div className={cn("p-4", isCollapsed ? "sr-only" : "")}>
        {children}
      </div>
    </Component>
  );
}

// ============================
// ResponsiveCollection Component
// ============================

type DisplayType = "grid" | "list" | "compact";

interface ResponsiveCollectionProps<T> {
  /**
   * Collection items to display
   */
  items: T[];
  /**
   * Display type at different breakpoints
   */
  displayType?: {
    default?: DisplayType;
    sm?: DisplayType;
    md?: DisplayType;
    lg?: DisplayType;
  };
  /**
   * Number of columns at different breakpoints (for grid)
   */
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Render function for each item
   */
  renderItem: (item: T, displayType: DisplayType) => React.ReactNode;
  /**
   * Class name to apply to container
   */
  className?: string;
}

/**
 * ResponsiveCollection component - displays collection items in grid, list, or compact mode based on breakpoint
 */
export function ResponsiveCollection<T>({
  items,
  displayType = { default: "list", md: "grid" },
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  renderItem,
  className = "",
}: ResponsiveCollectionProps<T>) {
  const { currentBreakpoint } = useViewport();
  
  // Determine current display type
  const getCurrentDisplayType = (): DisplayType => {
    switch (currentBreakpoint) {
      case "2xl":
      case "xl":
        return displayType.lg ?? displayType.md ?? displayType.sm ?? displayType.default ?? "grid";
      case "lg":
        return displayType.lg ?? displayType.md ?? displayType.sm ?? displayType.default ?? "grid";
      case "md":
        return displayType.md ?? displayType.sm ?? displayType.default ?? "grid";
      case "sm":
        return displayType.sm ?? displayType.default ?? "list";
      case "xs":
      default:
        return displayType.default ?? "list";
    }
  };
  
  // Determine current column count
  const getCurrentColumnCount = (): number => {
    switch (currentBreakpoint) {
      case "2xl":
      case "xl":
        return columns.xl ?? columns.lg ?? columns.md ?? columns.sm ?? columns.default ?? 4;
      case "lg":
        return columns.lg ?? columns.md ?? columns.sm ?? columns.default ?? 3;
      case "md":
        return columns.md ?? columns.sm ?? columns.default ?? 2;
      case "sm":
        return columns.sm ?? columns.default ?? 1;
      case "xs":
      default:
        return columns.default ?? 1;
    }
  };
  
  const currentDisplayType = getCurrentDisplayType();
  const currentColumnCount = getCurrentColumnCount();
  
  // Render collection based on display type
  const renderCollection = () => {
    switch (currentDisplayType) {
      case "grid":
        return (
          <div 
            className={cn(
              "grid gap-4",
              `grid-cols-${currentColumnCount}`,
              className
            )}
            style={{ 
              gridTemplateColumns: `repeat(${currentColumnCount}, minmax(0, 1fr))` 
            }}
          >
            {items.map((item, index) => (
              <div key={index} className="w-full">
                {renderItem(item, "grid")}
              </div>
            ))}
          </div>
        );
      case "compact":
        return (
          <div className={cn("space-y-2", className)}>
            {items.map((item, index) => (
              <div key={index} className="w-full">
                {renderItem(item, "compact")}
              </div>
            ))}
          </div>
        );
      case "list":
      default:
        return (
          <div className={cn("space-y-4", className)}>
            {items.map((item, index) => (
              <div key={index} className="w-full">
                {renderItem(item, "list")}
              </div>
            ))}
          </div>
        );
    }
  };
  
  return renderCollection();
} 