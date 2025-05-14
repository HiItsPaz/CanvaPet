"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Cropper from "react-easy-crop";
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { motion, AnimatePresence } from "framer-motion";

// Utility function to create an image from a URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Utility function to get cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<{ url: string; blob: Blob }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Set canvas dimensions to match the safe area
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Draw rotated image
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  );

  // Get data from the safe area
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas to final size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Place the data at the correct position
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Canvas is empty");
      }
      const url = window.URL.createObjectURL(blob);
      resolve({ url, blob });
    }, "image/jpeg");
  });
}

// Define aspect ratio presets
type AspectRatioPreset = {
  value: string;
  label: string;
  ratio: number;
};

const aspectRatioPresets: AspectRatioPreset[] = [
  { value: "1:1", label: "Square (1:1)", ratio: 1 },
  { value: "4:3", label: "Standard (4:3)", ratio: 4 / 3 },
  { value: "3:2", label: "Photo (3:2)", ratio: 3 / 2 },
  { value: "16:9", label: "Widescreen (16:9)", ratio: 16 / 9 },
  { value: "3:4", label: "Portrait (3:4)", ratio: 3 / 4 },
  { value: "2:3", label: "Portrait (2:3)", ratio: 2 / 3 },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

// Helper to get aspect ratio from string
const getAspectRatioFromString = (aspectRatio: string): number => {
  const preset = aspectRatioPresets.find((p) => p.value === aspectRatio);
  if (preset) return preset.ratio;

  // Parse from string format like "16:9"
  const parts = aspectRatio.split(":");
  if (parts.length === 2) {
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (!isNaN(width) && !isNaN(height) && height !== 0) {
      return width / height;
    }
  }

  // Default to square if invalid
  return 1;
};

export interface CropResult {
  croppedImageUrl: string;
  croppedAreaPixels: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blob?: Blob;
}

export interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (result: CropResult) => void;
  initialAspectRatio?: number;
  aspectRatio?: string;
  onCancel?: () => void;
  className?: string;
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
  initialRotation?: number;
  minCropWidth?: number;
  minCropHeight?: number;
  qualityWarnings?: string[];
}

export function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  className,
  initialAspectRatio = 1,
  initialCrop = { x: 0, y: 0 },
  initialZoom = 1,
  initialRotation = 0,
  aspectRatio = "1:1",
  minCropWidth = 200,
  minCropHeight = 200,
  qualityWarnings = [],
}: ImageCropperProps) {
  const [crop, setCrop] = useState(initialCrop);
  const [rotation, setRotation] = useState(initialRotation);
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatio);
  const [showWarnings, setShowWarnings] = useState(qualityWarnings.length > 0);

  const getAspectRatio = useCallback(() => {
    const preset = aspectRatioPresets.find(
      (preset) => preset.value === selectedAspectRatio
    );
    return preset?.ratio || 1;
  }, [selectedAspectRatio]);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const onCropAreaComplete = useCallback(
    (croppedArea: { x: number; y: number; width: number; height: number }, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(croppedAreaPixels);
      
      // Validate minimum crop dimensions
      if (croppedAreaPixels.width < minCropWidth || croppedAreaPixels.height < minCropHeight) {
        setCropError(`Crop area too small. Minimum dimensions are ${minCropWidth}x${minCropHeight} pixels.`);
      } else {
        setCropError(null);
      }
    },
    [minCropWidth, minCropHeight]
  );

  const handleAspectRatioChange = useCallback((value: string) => {
    setSelectedAspectRatio(value);
  }, []);

  const handleResetCrop = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCropError(null);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels) {
      setCropError("Please select a crop area first");
      return;
    }
    
    // Validate minimum crop dimensions again before proceeding
    if (croppedAreaPixels.width < minCropWidth || croppedAreaPixels.height < minCropHeight) {
      setCropError(`Crop area too small. Minimum dimensions are ${minCropWidth}x${minCropHeight} pixels.`);
      return;
    }
    
    try {
      setIsProcessing(true);
      setCropError(null);
      
      const { url, blob } = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation
      );
      
      onCropComplete({
        croppedImageUrl: url,
        croppedAreaPixels,
        blob
      });
    } catch (error) {
      console.error("Error cropping image:", error);
      setCropError("Failed to crop image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageUrl, rotation, onCropComplete, minCropWidth, minCropHeight]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Error message */}
      {cropError && (
        <ErrorMessage
          title="Crop Error"
          message={cropError}
          severity="warning"
          recoveryAction={{
            label: "Reset Crop",
            onClick: handleResetCrop
          }}
        />
      )}
      
      {/* Quality warnings */}
      <AnimatePresence>
        {qualityWarnings.length > 0 && showWarnings && (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ErrorMessage
              title="Image Quality Notice"
              message="We detected some quality issues that could affect the final result. Try to crop the best part of your image."
              severity="info"
              dismissible
              onDismiss={() => setShowWarnings(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <LoadingAnimation 
              variant="spinner"
              size="lg"
              text="Processing your image..."
              center
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cropper Container */}
      <div className="relative h-80 overflow-hidden rounded-md border bg-muted/20 flex items-center justify-center">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={getAspectRatio()}
          rotation={rotation}
          onCropChange={onCropChange}
          onCropComplete={onCropAreaComplete}
          onZoomChange={onZoomChange}
          onRotationChange={onRotationChange}
          objectFit="contain"
          cropShape={selectedAspectRatio === "circle" ? "round" : "rect"}
          showGrid={true}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="aspect-ratio" className="text-sm font-medium w-28">
            Aspect Ratio:
          </label>
          <Select
            value={selectedAspectRatio}
            onValueChange={handleAspectRatioChange}
          >
            <SelectTrigger id="aspect-ratio" className="flex-1">
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              {aspectRatioPresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zoom Control */}
        <div className="flex items-center gap-2">
          <label htmlFor="zoom" className="text-sm font-medium w-28">
            Zoom:
          </label>
          <div className="flex-1 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Slider
              id="zoom"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Rotation Control (Optional) */}
        <div className="flex items-center gap-2">
          <label htmlFor="rotation" className="text-sm font-medium w-28">
            Rotation:
          </label>
          <div className="flex-1 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-sm text-muted-foreground text-center">
              {rotation}°
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleResetCrop}
              title="Reset all settings"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Crop dimensions info */}
        {croppedAreaPixels && (
          <div className="text-xs text-muted-foreground">
            Crop dimensions: {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)} pixels
            {(croppedAreaPixels.width < minCropWidth || croppedAreaPixels.height < minCropHeight) && (
              <span className="text-amber-500 ml-2 flex items-center">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Too small
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleCropConfirm} 
          disabled={isProcessing || (cropError !== null)}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Apply Crop
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 