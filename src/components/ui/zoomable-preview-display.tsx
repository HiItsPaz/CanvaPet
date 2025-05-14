"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImagePreview } from "@/components/ui/image-preview";
import { Button } from "@/components/ui/button";
import { Download, Share2, Info, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type ProcessingStatus = "success" | "error" | "warning" | null;

export interface ZoomablePreviewDisplayProps {
  imageUrl: string;
  alt: string;
  title?: string;
  description?: string;
  status?: ProcessingStatus;
  statusMessage?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onReprocess?: () => void;
  metadata?: Record<string, any>;
  className?: string;
  hideControls?: boolean;
  maxHeight?: number | string;
}

export function ZoomablePreviewDisplay({
  imageUrl,
  alt,
  title,
  description,
  status = null,
  statusMessage,
  onDownload,
  onShare,
  onReprocess,
  metadata,
  className,
  hideControls = false,
  maxHeight = 500,
}: ZoomablePreviewDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = async () => {
    if (onDownload) {
      setIsDownloading(true);
      try {
        await onDownload();
      } finally {
        setIsDownloading(false);
      }
    } else {
      setIsDownloading(true);
      try {
        // Default download behavior if no handler provided
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `processed-image-${Date.now()}.jpg`;
        
        // Append, click, and clean up
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error downloading image:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleShare = async () => {
    if (onShare) {
      setIsSharing(true);
      try {
        await onShare();
      } finally {
        setIsSharing(false);
      }
    } else {
      setIsSharing(true);
      try {
        // Default share behavior if no handler provided
        if (navigator.share) {
          // Web Share API
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `processed-image-${Date.now()}.jpg`, { type: "image/jpeg" });
          
          await navigator.share({
            title: title || "Processed Image",
            text: description || "Check out this processed image!",
            files: [file],
          });
        } else {
          // Fallback to copy URL
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        }
      } catch (error) {
        console.error("Error sharing image:", error);
      } finally {
        setIsSharing(false);
      }
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && (
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{title}</CardTitle>
              {status && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant={
                        status === "success" ? "success" : 
                        status === "error" ? "destructive" : 
                        "outline"
                      } className="ml-2">
                        <span className="flex items-center gap-1">
                          {getStatusIcon()}
                          {status}
                        </span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{statusMessage || `Processing ${status}`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div className="relative">
          <ImagePreview
            imageUrl={imageUrl}
            alt={alt}
            showControls={!hideControls}
            allowFullscreen
            maxHeight={maxHeight}
            metadata={metadata}
            className="rounded-none"
          />
          
          {/* Overlay action buttons for download and share */}
          {(onDownload || onShare || onReprocess) && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent flex justify-center gap-2">
              {onDownload && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-background/80 hover:bg-background"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              )}
              
              {onShare && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="bg-background/80 hover:bg-background"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {isSharing ? "Sharing..." : "Share"}
                </Button>
              )}
              
              {onReprocess && status === "error" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-destructive/80 hover:bg-destructive text-white"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Reprocess
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reprocess Image?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will attempt to process the image again. Any current results may be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onReprocess}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
          
          {/* Status message if provided */}
          {status === "error" && statusMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 pointer-events-none">
              <div className="bg-background/80 rounded-md p-3 max-w-[80%] text-center">
                <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                <p className="text-sm font-medium text-destructive">{statusMessage}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 