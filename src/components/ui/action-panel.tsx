"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Download, Share2, Facebook, Instagram, Twitter, Linkedin, Copy, Mail, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export interface ActionPanelProps {
  imageUrl: string;
  title?: string;
  description?: string;
  onDownload?: (format: ImageFormat, quality: ImageQuality) => Promise<void>;
  onShare?: (platform: SharePlatform) => Promise<void>;
  className?: string;
}

export type ImageFormat = "jpg" | "png" | "webp";
export type ImageQuality = "high" | "medium" | "low";
export type SharePlatform = "facebook" | "twitter" | "instagram" | "linkedin" | "email" | "copy" | "native";

export function ActionPanel({
  imageUrl,
  title = "Processed Image",
  description,
  onDownload,
  onShare,
  className,
}: ActionPanelProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>("jpg");
  const [selectedQuality, setSelectedQuality] = useState<ImageQuality>("high");

  // Helper to get MIME type from format
  const getMimeType = (format: ImageFormat): string => {
    switch (format) {
      case "jpg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      default:
        return "image/jpeg";
    }
  };

  // Helper to get quality value from quality setting
  const getQualityValue = (quality: ImageQuality): number => {
    switch (quality) {
      case "high":
        return 0.9;
      case "medium":
        return 0.7;
      case "low":
        return 0.5;
      default:
        return 0.9;
    }
  };

  // Default download implementation
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      if (onDownload) {
        // Use custom download handler if provided
        await onDownload(selectedFormat, selectedQuality);
      } else {
        // Default implementation
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Convert to desired format if needed
        const targetMimeType = getMimeType(selectedFormat);
        let processedBlob = blob;
        
        // Only process if the format is different or quality needs to be adjusted
        if (blob.type !== targetMimeType || selectedQuality !== "high") {
          // Create an image and canvas for conversion
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
          });
          
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Could not get canvas context");
          
          ctx.drawImage(img, 0, 0);
          
          // Convert to the target format with specified quality
          const quality = getQualityValue(selectedQuality);
          const dataUrl = canvas.toDataURL(targetMimeType, quality);
          
          // Convert data URL to blob
          const byteString = atob(dataUrl.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          processedBlob = new Blob([ab], { type: targetMimeType });
          
          // Clean up
          URL.revokeObjectURL(img.src);
        }
        
        // Create download URL and trigger download
        const downloadUrl = URL.createObjectURL(processedBlob);
        const extension = selectedFormat === "jpg" ? "jpg" : selectedFormat;
        const filename = `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${extension}`;
        
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }, 100);
        
        toast({
          title: "Download Started",
          description: `Your image is being downloaded as ${extension.toUpperCase()}.`,
        });
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Share to specific platform
  const handleShare = async (platform: SharePlatform) => {
    try {
      setIsSharing(true);
      
      if (onShare) {
        // Use custom share handler if provided
        await onShare(platform);
      } else {
        // Default implementation
        switch (platform) {
          case "native":
            // Use Web Share API if available
            if (navigator.share) {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], `${title.toLowerCase().replace(/\s+/g, "-")}.jpg`, { type: "image/jpeg" });
              
              await navigator.share({
                title: title,
                text: description || `Check out this ${title}!`,
                files: [file],
                url: window.location.href,
              });
              
              toast({
                title: "Shared Successfully",
              });
            } else {
              // Fallback to copy URL
              await navigator.clipboard.writeText(window.location.href);
              toast({
                title: "Link Copied",
                description: "The link has been copied to your clipboard.",
              });
            }
            break;
            
          case "copy":
            await navigator.clipboard.writeText(window.location.href);
            toast({
              title: "Link Copied",
              description: "The link has been copied to your clipboard.",
            });
            break;
            
          case "facebook":
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(description || `Check out this ${title}!`)}`, '_blank');
            toast({
              title: "Sharing to Facebook",
              description: "Facebook sharing window has been opened.",
            });
            break;
            
          case "twitter":
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(description || `Check out this ${title}!`)}`, '_blank');
            toast({
              title: "Sharing to Twitter",
              description: "Twitter sharing window has been opened.",
            });
            break;
            
          case "linkedin":
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
            toast({
              title: "Sharing to LinkedIn",
              description: "LinkedIn sharing window has been opened.",
            });
            break;
            
          case "email":
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || `Check out this ${title}!`}\n\n${window.location.href}`)}`;
            toast({
              title: "Sharing via Email",
              description: "Email client has been opened.",
            });
            break;
            
          case "instagram":
            toast({
              title: "Instagram Sharing",
              description: "Instagram sharing is only available via their mobile app. The link has been copied to your clipboard instead.",
            });
            await navigator.clipboard.writeText(window.location.href);
            break;
            
          default:
            // Fallback to copy URL
            await navigator.clipboard.writeText(window.location.href);
            toast({
              title: "Link Copied",
              description: "The link has been copied to your clipboard.",
            });
        }
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      toast({
        title: "Sharing Failed",
        description: "There was an error sharing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Function to get social media platform icon
  const getPlatformIcon = (platform: SharePlatform) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "copy":
        return <Copy className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("mt-4", className)}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{title} Options</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Download</h3>
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="min-w-28"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select 
                value={selectedFormat} 
                onValueChange={(value) => setSelectedFormat(value as ImageFormat)}
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG (Smaller size)</SelectItem>
                  <SelectItem value="png">PNG (Better quality)</SelectItem>
                  <SelectItem value="webp">WebP (Modern format)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <RadioGroup 
                value={selectedQuality} 
                onValueChange={(value) => setSelectedQuality(value as ImageQuality)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="cursor-pointer">High (Larger file)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer">Medium (Balanced)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="cursor-pointer">Low (Smaller file)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Share</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isSharing}
                  className="min-w-28"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleShare("native")}>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Quick Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShare("facebook")}>
                  <Facebook className="mr-2 h-4 w-4" />
                  <span>Facebook</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("twitter")}>
                  <Twitter className="mr-2 h-4 w-4" />
                  <span>Twitter</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("instagram")}>
                  <Instagram className="mr-2 h-4 w-4" />
                  <span>Instagram</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                  <Linkedin className="mr-2 h-4 w-4" />
                  <span>LinkedIn</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShare("email")}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("copy")}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("facebook")}
              title="Share to Facebook"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("twitter")}
              title="Share to Twitter"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("instagram")}
              title="Share to Instagram"
            >
              <Instagram className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare("linkedin")}
              title="Share to LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 