import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card"

interface InteractiveCardProps extends React.ComponentProps<typeof Card> {
  href?: string
  onClick?: () => void
  hoverEffect?: "scale" | "border" | "shadow" | "glow" | "none"
  disabled?: boolean
  selected?: boolean
  interactive?: boolean
  withRipple?: boolean
  fullWidth?: boolean
  fullHeight?: boolean
}

export const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  InteractiveCardProps
>(({
  className,
  href,
  onClick,
  hoverEffect = "scale",
  disabled = false,
  selected = false,
  interactive = true,
  withRipple = false,
  fullWidth = false,
  fullHeight = false,
  children,
  ...props
}, ref) => {
  // Track ripple effect
  const [ripple, setRipple] = React.useState<{x: number, y: number, active: boolean}>({
    x: 0,
    y: 0,
    active: false
  })
  
  // Determine the hover effect class
  const hoverEffectClass = React.useMemo(() => {
    if (!interactive || disabled || hoverEffect === "none") return ""
    
    switch (hoverEffect) {
      case "scale":
        return "transition-transform hover:scale-[1.02] active:scale-[0.98]"
      case "border":
        return "transition-colors hover:border-primary"
      case "shadow":
        return "transition-shadow hover:shadow-lg"
      case "glow":
        return "transition-shadow hover:shadow-md hover:shadow-primary/15"
      default:
        return ""
    }
  }, [hoverEffect, interactive, disabled])
  
  // Handle ripple effect
  const handleRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!withRipple || disabled) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setRipple({ x, y, active: true })
    
    setTimeout(() => {
      setRipple(r => ({ ...r, active: false }))
    }, 500)
  }
  
  // Card styles
  const cardStyles = cn(
    "relative",
    interactive && !disabled && "cursor-pointer",
    disabled && "opacity-60 cursor-not-allowed",
    selected && "ring-2 ring-primary",
    fullWidth && "w-full",
    fullHeight && "h-full",
    hoverEffectClass,
    className
  )
  
  // Create the card content
  const cardContent = (
    <Card
      ref={ref}
      className={cardStyles}
      onClick={(e) => {
        if (disabled) return
        handleRipple(e)
        onClick?.()
      }}
      {...props}
    >
      {children}
      
      {withRipple && ripple.active && (
        <span 
          className="absolute rounded-full bg-primary/20 animate-ripple"
          style={{
            top: ripple.y,
            left: ripple.x,
            transformOrigin: 'center',
            pointerEvents: 'none'
          }}
        />
      )}
    </Card>
  )
  
  // Either wrap in a link or return the card directly
  if (href && !disabled) {
    return (
      <Link href={href} className={cn(fullWidth && "w-full block", fullHeight && "h-full block")}>
        {cardContent}
      </Link>
    )
  }
  
  return cardContent
})

InteractiveCard.displayName = "InteractiveCard"

export const InteractiveCardTitle = CardTitle
export const InteractiveCardDescription = CardDescription
export const InteractiveCardContent = CardContent
export const InteractiveCardFooter = CardFooter
export const InteractiveCardHeader = CardHeader 