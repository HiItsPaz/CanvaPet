"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Download, Share2, ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { PreviewProgress } from "./PreviewProgress";
import { StylePreview } from "./StylePreview";
import { useCustomization } from "@/contexts/CustomizationContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PreviewDisplayProps {
  previewUrl: string | null;
  isLoading: boolean;
  onRefresh?: () => void;
  petName?: string;
}

export function PreviewDisplay({
  previewUrl,
  isLoading,
  onRefresh,
  petName = "pet",
}: PreviewDisplayProps) {
  const { parameters, availableStyles, selectStyle, adjustStyleIntensity } = useCustomization();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeView, setActiveView] = useState<"preview" | "styleTester">("preview");
  
  // Find the current selected style
  const selectedStyle = 
    availableStyles.find(style => style.id === parameters.styleId) || null;

  const handleDownload = async () => {
    if (!previewUrl) return;
    
    try {
      setIsDownloading(true);
      
      // Fetch the image to get a blob
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${petName.toLowerCase().replace(/\s+/g, "-")}-customized.jpg`;
      
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
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    
    try {
      setIsSharing(true);
      
      // Check if Web Share API is available
      if (navigator.share) {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const file = new File([blob], `${petName}-customized.jpg`, { type: "image/jpeg" });
        
        await navigator.share({
          title: `Custom ${petName} Portrait`,
          text: `Check out this custom portrait of ${petName}!`,
          files: [file],
        });
      } else {
        // Fallback if Web Share API is not available
        // Could implement copy to clipboard or open a share modal
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle style change
  const handleStyleChange = (styleId: string) => {
    selectStyle(styleId);
  };

  // Handle intensity change
  const handleIntensityChange = (value: number) => {
    adjustStyleIntensity(value);
  };

  return (
    <Card className="p-4">
      {/* View Toggle */}
      <div className="mb-4">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "preview" | "styleTester")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center justify-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>Final Preview</span>
            </TabsTrigger>
            <TabsTrigger value="styleTester" className="flex items-center justify-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span>Style Tester</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-0 pt-4">
            <div className="aspect-square bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-6 w-full">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground mb-6">Generating preview...</p>
                  
                  <div className="w-full max-w-md">
                    <PreviewProgress 
                      isGenerating={isLoading}
                      duration={2500}
                    />
                  </div>
                </div>
              ) : previewUrl ? (
                <>
                  <Image 
                    src={previewUrl} 
                    alt={`Customized ${petName}`}
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                  
                  {/* Action buttons overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="flex justify-center gap-2">
                      {onRefresh && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={onRefresh}
                          className="bg-background/80 hover:bg-background"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="bg-background/80 hover:bg-background"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleShare}
                        disabled={isSharing}
                        className="bg-background/80 hover:bg-background"
                      >
                        {isSharing ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4 mr-1" />
                        )}
                        Share
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <p className="text-muted-foreground">
                    Select options and click &quot;Preview&quot; to see your {petName}&apos;s transformation
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="styleTester" className="mt-0 pt-4">
            <StylePreview
              style={selectedStyle}
              petImageUrl="/placeholders/pet-default.jpg" // Replace with actual pet image URL
              onStyleChange={handleStyleChange}
              onIntensityChange={handleIntensityChange}
              intensity={parameters.styleIntensity || 50}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Information text */}
      <div className="mt-2 text-center text-sm text-muted-foreground">
        <p>
          {activeView === "preview"
            ? "Final preview with all customizations applied"
            : "Try different styles and adjustments in real-time"}
        </p>
      </div>
    </Card>
  );
} 