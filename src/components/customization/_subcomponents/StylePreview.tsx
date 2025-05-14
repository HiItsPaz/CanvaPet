"use client";

import { useState, useEffect } from "react";
import { Style } from "@/types/customization";
import { useCustomization } from "@/contexts/CustomizationContext";
import { motion, AnimatePresence } from "framer-motion";
import { BlurHashImage } from "./BlurHashImage";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, EyeOff, Sparkles, Palette, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStylePreview } from "@/hooks/useStylePreview";

interface StylePreviewProps {
  style: Style | null;
  petImageUrl?: string;
  onStyleChange?: (styleId: string) => void;
  onIntensityChange?: (value: number) => void;
  intensity?: number;
  isLoading?: boolean;
  className?: string;
}

export function StylePreview({
  style,
  petImageUrl = "/placeholders/pet-default.jpg",
  onStyleChange,
  onIntensityChange,
  intensity = 50,
  isLoading = false,
  className
}: StylePreviewProps) {
  const { parameters, availableStyles, isPreviewGenerating, generatePreview } = useCustomization();
  const [showControls, setShowControls] = useState(true);
  const [previewMode, setPreviewMode] = useState<"split" | "full">("split");
  const [compareStyles, setCompareStyles] = useState<Style[]>([]);
  
  // Use our style preview hook
  const {
    previewUrl: stylePreviewUrl,
    isGenerating: isGeneratingStylePreview,
    generatePreview: generateStylePreview
  } = useStylePreview({
    petImageUrl,
  });

  // Generate random compare styles
  useEffect(() => {
    if (availableStyles.length > 1) {
      // Get 2 random styles that aren't the current style
      const otherStyles = availableStyles
        .filter(s => s.id !== style?.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      
      setCompareStyles(otherStyles);
    }
  }, [availableStyles, style?.id]);
  
  // Reset preview mode when style changes
  useEffect(() => {
    setPreviewMode("split");
  }, [style?.id]);

  // Generate preview when style or intensity changes
  useEffect(() => {
    if (style?.id) {
      generateStylePreview(style.id, intensity);
    }
  }, [style?.id, intensity, generateStylePreview]);

  // Handle intensity change
  const handleIntensityChange = (value: number[]) => {
    if (onIntensityChange) {
      onIntensityChange(value[0]);
    }
  };
  
  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(prev => prev === "split" ? "full" : "split");
  };
  
  // Handle style selection
  const selectStyle = (styleId: string) => {
    if (onStyleChange) {
      onStyleChange(styleId);
    }
  };
  
  // Compute if we should show the loading state
  const showLoading = isLoading || isGeneratingStylePreview || isPreviewGenerating;
  
  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        {style ? (
          <motion.div
            key={`style-preview-${style.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full"
          >
            {/* Preview Image Display */}
            <div className="relative aspect-square overflow-hidden">
              {previewMode === "split" ? (
                <div className="grid grid-cols-2 h-full">
                  {/* Original Pet Image */}
                  <div className="relative h-full">
                    <BlurHashImage
                      src={petImageUrl}
                      alt="Original pet"
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        Original
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Styled Image */}
                  <div className="relative h-full">
                    <BlurHashImage
                      src={stylePreviewUrl || style.thumbnailUrl || "/placeholders/style-preview.jpg"}
                      blurHash={style.blurhash}
                      alt={`${style.name} style preview`}
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {style.name}
                      </Badge>
                    </div>
                    
                    {/* Style Intensity Indicator */}
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                      {intensity}%
                    </div>
                  </div>
                </div>
              ) : (
                // Full Preview Mode
                <div className="relative h-full">
                  <BlurHashImage
                    src={stylePreviewUrl || style.thumbnailUrl || "/placeholders/style-preview.jpg"}
                    blurHash={style.blurhash}
                    alt={`${style.name} style preview`}
                    fill
                    sizes="100vw" 
                    className="object-cover"
                  />
                  
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {style.name} • {intensity}% Intensity
                    </Badge>
                  </div>
                </div>
              )}
              
              {/* Loading Overlay */}
              {showLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-background/90 rounded-lg p-4 shadow-lg">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-8 w-8 text-primary" />
                    </motion.div>
                    <p className="mt-2 text-center">Applying style...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Controls Panel */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 pt-8"
                >
                  {/* Style Intensity Slider */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Style Intensity</span>
                      <span className="text-sm font-bold">{intensity}%</span>
                    </div>
                    <Slider
                      defaultValue={[intensity]}
                      max={100}
                      step={1}
                      onValueChange={handleIntensityChange}
                      disabled={showLoading}
                    />
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={togglePreviewMode}
                        className="bg-background/50 backdrop-blur-sm"
                      >
                        {previewMode === "split" ? (
                          <>
                            <Palette className="h-4 w-4 mr-1" />
                            Full View
                          </>
                        ) : (
                          <>
                            <Palette className="h-4 w-4 mr-1" />
                            Split View
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          if (style?.id) {
                            generateStylePreview(style.id, intensity);
                          }
                        }}
                        disabled={showLoading || !style?.id}
                        className="bg-background/50 backdrop-blur-sm"
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-1", { "animate-spin": showLoading })} />
                        Refresh
                      </Button>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowControls(false)}
                      className="h-8 w-8 bg-background/50 backdrop-blur-sm rounded-full"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Show Controls Button (when hidden) */}
            {!showControls && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowControls(true)}
                className="absolute bottom-3 right-3 h-8 w-8 bg-background/50 backdrop-blur-sm rounded-full"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        ) : (
          // No style selected state
          <motion.div
            key="no-style-selected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="aspect-square bg-muted flex flex-col items-center justify-center p-6 text-center"
          >
            <Palette className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Style Selected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a style from the options below to see a preview
            </p>
            
            {/* Style Suggestions */}
            {availableStyles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <p className="w-full text-sm text-muted-foreground">Popular styles:</p>
                {availableStyles.slice(0, 3).map((style) => (
                  <Button
                    key={style.id}
                    variant="outline"
                    size="sm"
                    onClick={() => selectStyle(style.id)}
                    className="gap-1.5"
                  >
                    <div 
                      className="relative h-4 w-4 rounded-full overflow-hidden"
                      style={{
                        backgroundColor: '#cbd5e1'
                      }}
                    >
                      {style.thumbnailUrl && (
                        <BlurHashImage
                          src={style.thumbnailUrl}
                          alt=""
                          fill
                          sizes="16px"
                          className="object-cover opacity-70"
                        />
                      )}
                    </div>
                    {style.name}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style Comparison Section (when a style is selected) */}
      {style && compareStyles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Compare with other styles</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {compareStyles.map((compareStyle) => (
              <div
                key={compareStyle.id}
                className="relative aspect-square rounded-md overflow-hidden cursor-pointer border border-border hover:border-primary transition-colors"
                onClick={() => selectStyle(compareStyle.id)}
              >
                <BlurHashImage
                  src={compareStyle.thumbnailUrl || "/placeholders/style-preview.jpg"}
                  blurHash={compareStyle.blurhash}
                  alt={`${compareStyle.name} style`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-2">
                  <p className="text-xs font-medium truncate">{compareStyle.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 