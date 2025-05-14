"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Style } from "@/types/customization";
import { CheckCircle } from "lucide-react";
import { BlurHashImage } from "./BlurHashImage";
import { useEffect, useRef, KeyboardEvent } from "react";

interface StyleCardProps {
  style: Style;
  isSelected: boolean;
  onSelect: (styleId: string) => void;
  size?: "regular" | "medium" | "large";
  highlighted?: boolean;
  ariaLabel?: string;
}

export function StyleCard({ 
  style, 
  isSelected, 
  onSelect, 
  size = "regular",
  highlighted = false,
  ariaLabel
}: StyleCardProps) {
  // Reference to the card element for focus management
  const cardRef = useRef<HTMLDivElement>(null);

  // Size-specific classes
  const sizeClasses = {
    regular: "",
    medium: "sm:col-span-2",
    large: "sm:col-span-2 sm:row-span-2",
  };

  // Handle header padding and aspect ratio based on size
  const getHeaderClasses = () => {
    switch (size) {
      case "large":
        return "p-0 relative aspect-video";
      case "medium":
        return "p-0 relative aspect-[4/2.5]";
      default:
        return "p-0 relative aspect-[4/3]";
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(style.id);
    }
  };

  // Focus the card if it becomes selected programmatically
  useEffect(() => {
    if (isSelected && cardRef.current) {
      // Don't focus if selection wasn't from user interaction
      // This is to prevent unexpected focus jumps
      // cardRef.current.focus();
    }
  }, [isSelected]);

  return (
    <Card
      ref={cardRef}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
      aria-label={ariaLabel || `Style: ${style.name}${style.description ? `. ${style.description}` : ''}`}
      className={cn(
        "cursor-pointer transition-all duration-300 overflow-hidden group",
        "transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected ? "ring-2 ring-primary shadow-lg" : "ring-1 ring-transparent",
        highlighted && !isSelected && "ring-1 ring-accent-foreground",
        sizeClasses[size]
      )}
      onClick={() => onSelect(style.id)}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className={getHeaderClasses()}>
        <BlurHashImage
          src={style.thumbnailUrl || "/placeholder-image.jpg"} // Fallback placeholder
          blurHash={style.blurhash}
          alt={style.name}
          fill
          sizes={
            size === "large" 
              ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
          className={cn(
            "object-cover rounded-t-lg transition-transform duration-500",
            "group-hover:scale-[1.05]",
            "group-focus-visible:scale-[1.05]",
            highlighted && "scale-105"
          )}
        />
        {isSelected && (
          <div 
            className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 z-10 
                      animate-in fade-in zoom-in duration-300"
          >
            <CheckCircle className="h-5 w-5" />
          </div>
        )}
        {highlighted && !isSelected && (
          <div className="absolute inset-0 bg-accent/10 rounded-t-lg z-10" />
        )}
      </CardHeader>
      <CardContent className={cn(
        "p-3 relative transition-colors group-hover:bg-muted/30 group-focus-visible:bg-muted/30",
        size === "large" && "p-4"
      )}>
        <CardTitle 
          className={cn(
            "font-semibold truncate", 
            size === "large" ? "text-lg" : "text-md"
          )} 
          title={style.name}
        >
          {style.name}
        </CardTitle>
        {style.description && (
          <CardDescription className={cn(
            "mt-1 truncate", 
            size === "large" ? "text-sm line-clamp-2" : "text-xs"
          )} title={style.description}>
            {style.description}
          </CardDescription>
        )}
        {style.tags && style.tags.length > 0 && size === "large" && (
          <div className="flex flex-wrap gap-1 mt-2">
            {style.tags.map(tag => (
              <span 
                key={tag} 
                className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Visual feedback on hover/focus - subtle shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 
                      pointer-events-none transition-opacity duration-500 
                      bg-gradient-to-tr from-transparent via-primary/5 to-transparent" 
        />
      </CardContent>
    </Card>
  );
} 