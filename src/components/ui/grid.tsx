import * as React from "react";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

export function Grid({
  children,
  className = "",
  columns = { default: 1, md: 2, lg: 3 },
  gap = "md",
  ...props
}: GridProps) {
  // Convert columns to grid-template-columns utility classes
  const getColumnClasses = () => {
    const classes = [];
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    if (columns["2xl"]) classes.push(`2xl:grid-cols-${columns["2xl"]}`);
    return classes.join(" ");
  };

  // Gap classes
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  return (
    <div
      className={`grid ${getColumnClasses()} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 