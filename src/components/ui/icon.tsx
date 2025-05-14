"use client"

import * as React from "react"
import { LucideIcon, LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconProps extends LucideProps {
  /** The icon component to render */
  icon: LucideIcon
  /** Optional label for accessibility */
  label?: string
  /** Whether to only show the label to screen readers */
  labelHidden?: boolean
  /** The size of the icon */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  /** Whether the icon is decorative only (no semantic meaning) */
  decorative?: boolean
}

/**
 * Icon component that wraps Lucide icons with additional features like
 * accessibility labels, sizing, and proper ARIA attributes.
 */
export function Icon({
  icon: LucideIcon,
  label,
  labelHidden = true,
  size = "md",
  decorative = false,
  className,
  ...props
}: IconProps) {
  // Map size to pixel values - we'll use this to set both height and width
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 40,
  }
  
  // Convert size to pixels
  const pixelSize = sizeMap[size]
  
  // Set appropriate ARIA attributes based on whether it's decorative or has a label
  const ariaAttributes = decorative
    ? { "aria-hidden": "true" as const }
    : label
    ? { "aria-label": label }
    : {}
  
  return (
    <span className={cn("inline-flex items-center justify-center", className)}>
      <LucideIcon
        height={pixelSize}
        width={pixelSize}
        {...ariaAttributes}
        {...props}
      />
      {label && labelHidden && (
        <span className="sr-only">{label}</span>
      )}
      {label && !labelHidden && (
        <span className="ml-2">{label}</span>
      )}
    </span>
  )
}

// Export as both named and default
export default Icon 