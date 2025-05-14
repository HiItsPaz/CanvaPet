import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { 
  Card, 
  CardFooter, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProfileCardProps extends React.ComponentProps<typeof Card> {
  avatar?: string
  name: string
  title?: string
  badges?: Array<{
    label: string
    variant?: "default" | "secondary" | "accent" | "destructive" | "outline"
  }>
  stats?: Array<{
    label: string
    value: string | number
  }>
  backgroundImage?: string
  actions?: React.ReactNode
  avatarFallback?: string
  avatarSize?: number
  layout?: "horizontal" | "vertical"
}

export const ProfileCard = React.forwardRef<
  HTMLDivElement,
  ProfileCardProps
>(({
  className,
  avatar,
  name,
  title,
  badges = [],
  stats = [],
  backgroundImage,
  actions,
  avatarFallback,
  avatarSize = 64,
  layout = "vertical",
  children,
  ...props
}, ref) => {
  // Create avatar initials from name
  const initials = React.useMemo(() => {
    if (!name) return ''
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }, [name])

  const isHorizontal = layout === "horizontal"

  return (
    <Card
      ref={ref}
      className={cn(
        "overflow-hidden",
        isHorizontal && "flex flex-row",
        className
      )}
      {...props}
    >
      {backgroundImage && (
        <div className="relative h-32 w-full">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
      
      <div className={cn(
        "flex flex-col",
        isHorizontal ? "flex-row items-center p-4 gap-4" : "",
        backgroundImage && !isHorizontal ? "-mt-16 relative" : ""
      )}>
        <div className={cn(
          "relative",
          isHorizontal ? "" : "mx-auto"
        )}>
          {avatar ? (
            <div 
              className={cn(
                "rounded-full border-4 border-background overflow-hidden",
                `h-[${avatarSize}px] w-[${avatarSize}px]`
              )}
              style={{ height: avatarSize, width: avatarSize }}
            >
              <Image
                src={avatar}
                alt={name}
                width={avatarSize}
                height={avatarSize}
                className="object-cover"
              />
            </div>
          ) : (
            <div 
              className={cn(
                "rounded-full bg-muted flex items-center justify-center text-xl font-semibold border-4 border-background",
                `h-[${avatarSize}px] w-[${avatarSize}px]`
              )}
              style={{ height: avatarSize, width: avatarSize }}
            >
              {avatarFallback || initials}
            </div>
          )}
        </div>
        
        <div className={cn(
          isHorizontal ? "flex-1" : "text-center p-4"
        )}>
          <CardTitle className="mt-2">{name}</CardTitle>
          {title && (
            <CardDescription>{title}</CardDescription>
          )}
          
          {badges.length > 0 && (
            <div className={cn(
              "flex flex-wrap gap-2 mt-3", 
              isHorizontal ? "" : "justify-center"
            )}>
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant={badge.variant || "default"}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {stats.length > 0 && (
        <div className={cn(
          "grid grid-cols-3 divide-x divide-border border-t",
          isHorizontal && "mt-auto"
        )}>
          {stats.map((stat, index) => (
            <div key={index} className="p-3 text-center">
              <div className="text-lg font-semibold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
      
      {actions && (
        <CardFooter className={isHorizontal ? "mt-auto border-t" : ""}>
          {actions}
        </CardFooter>
      )}
      
      {children}
    </Card>
  )
})

ProfileCard.displayName = "ProfileCard" 