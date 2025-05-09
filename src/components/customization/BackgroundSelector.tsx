"use client";

import { useState } from "react";
import { BackgroundOption, BackgroundType } from "@/types/customization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BackgroundSelectorProps {
  availableBackgrounds?: BackgroundOption[]; // For predefined patterns/scenes later
  selectedBackground: {
    type: BackgroundType;
    value: string;
  } | null;
  onBackgroundSelect: (background: {
    type: BackgroundType;
    value: string;
  } | null) => void;
  loading?: boolean;
}

const PRESET_COLORS: string[] = [
  "#FFFFFF", // White
  "#000000", // Black
  "#FEE2E2", // Light Red
  "#FEF3C7", // Light Yellow
  "#D1FAE5", // Light Green
  "#DBEAFE", // Light Blue
  "#E0E7FF", // Light Indigo
  "#F3E8FF", // Light Purple
  "#FCE7F3", // Light Pink
];

export function BackgroundSelector({
  selectedBackground,
  onBackgroundSelect,
  loading = false,
}: BackgroundSelectorProps) {
  const [customColor, setCustomColor] = useState(
    selectedBackground?.type === "color" ? selectedBackground.value : "#FFFFFF"
  );

  const handleColorSelect = (color: string) => {
    onBackgroundSelect({ type: "color", value: color });
  };

  const handleTransparentSelect = () => {
    onBackgroundSelect({ type: "transparent", value: "transparent" });
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    // Optionally, debounce this call if it triggers heavy re-renders
    onBackgroundSelect({ type: "color", value: e.target.value });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-1/3 bg-muted rounded animate-pulse"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Background</h3>
      
      <div>
        <Label className="text-sm font-medium">Preset Colors</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              className={cn(
                "h-8 w-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                selectedBackground?.type === "color" && selectedBackground?.value.toLowerCase() === color.toLowerCase()
                  ? "ring-2 ring-primary ring-offset-2"
                  : "ring-1 ring-gray-300 dark:ring-gray-700"
              )}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
            >
              {selectedBackground?.type === "color" && selectedBackground?.value.toLowerCase() === color.toLowerCase() && (
                <Check className="h-5 w-5 text-white mix-blend-difference" />
              )}
              <span className="sr-only">{color}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="customColor" className="text-sm font-medium">Custom Color</Label>
        <div className="mt-2 flex items-center gap-2">
          <Input
            id="customColor"
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-14 h-10 p-1"
          />
          <Input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange} // Allow text input for hex code
            placeholder="#RRGGBB"
            className="flex-1"
          />
        </div>
      </div>
      
      <div>
        <Button
          variant="outline"
          onClick={handleTransparentSelect}
          className={cn(
            selectedBackground?.type === "transparent" && "ring-2 ring-primary"
          )}
        >
          {selectedBackground?.type === "transparent" && <Check className="mr-2 h-4 w-4" />} 
          Transparent Background
        </Button>
      </div>

      {/* Placeholder for Pattern/Scene selection - to be implemented later */}
      {/* 
      <div>
        <Label className="text-sm font-medium">Patterns & Scenes</Label>
        <div className="mt-2 text-sm text-muted-foreground">
          Pattern and scene selection will be available soon.
        </div>
      </div>
      */}
    </div>
  );
} 