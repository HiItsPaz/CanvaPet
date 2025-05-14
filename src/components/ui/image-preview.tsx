"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Trash2, 
  Upload, 
  X, 
  RefreshCw,
  Maximize,
  Minimize
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  imageUrl: string;
  alt: string;
  onRemove?: () => void;
  onReupload?: () => void;
  className?: string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  aspectRatio?: string;
  showControls?: boolean;
  allowFullscreen?: boolean;
  metadata?: Record<string, any>;
}

export function ImagePreview({
  imageUrl,
  alt,
  onRemove,
  onReupload,
  className,
  maxHeight = 400,
  maxWidth = "100%",
  aspectRatio = "auto",
  showControls = true,
  allowFullscreen = true,
  metadata
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  // Handle image error event
  const handleImageError = () => {
    setIsLoading(false);
    setError("Failed to load image");
  };

  // Reset zoom and rotation
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  // Zoom in (max 3x)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  // Zoom out (min 0.5x)
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Confirm and remove image
  const handleRemoveConfirm = () => {
    setConfirmRemove(false);
    onRemove?.();
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className={cn("relative flex flex-col", className)}>
      {/* Image Container */}
      <div
        ref={imageRef}
        className={cn(
          "relative overflow-hidden rounded-md border bg-muted/20 flex items-center justify-center",
          {
            "w-full h-full fixed top-0 left-0 z-50 bg-background/90 rounded-none border-none":
              isFullscreen,
          }
        )}
        style={{
          maxHeight: isFullscreen ? "100vh" : maxHeight,
          maxWidth: isFullscreen ? "100vw" : maxWidth,
          aspectRatio: aspectRatio,
        }}
      >
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
            <div className="text-center space-y-2 p-4">
              <X className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-sm font-medium text-destructive">{error}</p>
              {onReupload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReupload}
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="transition-all duration-200 ease-in-out object-contain"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Close Fullscreen Button */}
        {isFullscreen && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-background/80 hover:bg-background"
            onClick={toggleFullscreen}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Controls */}
      {showControls && !isFullscreen && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="h-8 w-8"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="h-8 w-8"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRotate}
              className="h-8 w-8"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="h-8 w-8"
              title="Reset view"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {allowFullscreen && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
                title="Fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {onReupload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReupload}
                className="h-8"
                title="Upload new image"
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
            )}
            {onRemove && (
              <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove Image</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove this image? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleRemoveConfirm}
                    >
                      Remove
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      )}

      {/* Metadata Display (Optional) */}
      {metadata && (
        <div className="mt-2 p-2 bg-muted/40 rounded-md text-xs">
          <details>
            <summary className="cursor-pointer font-medium">
              Image Information
            </summary>
            <div className="mt-2 pl-2 border-l-2 border-muted-foreground/30">
              {Object.entries(metadata).map(([key, value]) => {
                // Skip complex nested objects
                if (typeof value === "object" && value !== null) return null;
                return (
                  <div key={key} className="flex items-start py-1">
                    <span className="font-medium mr-2">{key}:</span>
                    <span className="text-muted-foreground">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      )}
    </div>
  );
} 