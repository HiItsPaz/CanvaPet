import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card"

interface MediaCardProps extends React.ComponentProps<typeof Card> {
  src: string
  alt?: string
  aspectRatio?: "square" | "portrait" | "landscape" | "video" | "auto"
  overlay?: boolean
  overlayClassName?: string
  overlayContent?: React.ReactNode
  mediaClassName?: string
  isVideo?: boolean
  videoProps?: React.ComponentProps<"video">
  bleed?: boolean
  onMediaLoad?: () => void
  placeholderSrc?: string
}

export const MediaCard = React.forwardRef<
  HTMLDivElement,
  MediaCardProps
>(({
  className,
  src,
  alt = "",
  aspectRatio = "landscape",
  overlay = false,
  overlayClassName,
  overlayContent,
  mediaClassName,
  isVideo = false,
  videoProps,
  bleed = false,
  onMediaLoad,
  placeholderSrc,
  children,
  ...props
}, ref) => {
  const mediaRef = React.useRef<HTMLDivElement>(null)

  // Determine aspect ratio class
  const aspectRatioClass = React.useMemo(() => {
    switch(aspectRatio) {
      case "square": return "aspect-square"
      case "portrait": return "aspect-[3/4]"
      case "landscape": return "aspect-[16/9]"
      case "video": return "aspect-video"
      case "auto": return ""
      default: return "aspect-[16/9]"
    }
  }, [aspectRatio])

  return (
    <Card
      ref={ref}
      className={cn(
        "overflow-hidden",
        className
      )}
      {...props}
    >
      <div 
        ref={mediaRef}
        className={cn(
          "relative w-full",
          aspectRatioClass,
          bleed ? "rounded-b-none" : "m-0",
          mediaClassName
        )}
      >
        {isVideo ? (
          <video
            className="h-full w-full object-cover"
            src={src}
            onLoadedData={() => onMediaLoad?.()}
            {...videoProps}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onLoad={() => onMediaLoad?.()}
            placeholder={placeholderSrc ? "blur" : undefined}
            blurDataURL={placeholderSrc}
          />
        )}
        
        {overlay && (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent",
              overlayClassName
            )}
          >
            {overlayContent}
          </div>
        )}
      </div>
      
      {children}
    </Card>
  )
})

MediaCard.displayName = "MediaCard"

export const MediaCardTitle = CardTitle
export const MediaCardDescription = CardDescription
export const MediaCardContent = CardContent
export const MediaCardFooter = CardFooter
export const MediaCardHeader = CardHeader 