"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlurHashImageProps {
  src: string;
  blurHash?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onClick?: () => void;
}

export function BlurHashImage({
  src,
  blurHash,
  alt,
  width,
  height,
  className,
  aspectRatio,
  fill = false,
  sizes,
  priority = false,
  onLoad,
  onClick,
}: BlurHashImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Reset loaded state when src changes
  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setShowFallback(true);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatio && `aspect-[${aspectRatio}]`,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
    >
      {/* Blurred placeholder */}
      {blurHash && !isLoaded && !showFallback && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${blurHash})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px) saturate(150%)",
            transform: "scale(1.2)",
          }}
        />
      )}

      {/* Loading shimmer effect */}
      {!isLoaded && !showFallback && !blurHash && (
        <div className="absolute inset-0 z-0 animate-pulse bg-muted" />
      )}

      {/* Actual image */}
      {!showFallback ? (
        <Image
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
          {alt || "Image not available"}
        </div>
      )}
    </div>
  );
} 