"use client";

import { useState, useCallback } from "react";
import { StyleSelector } from "./StyleSelector";
import { BackgroundSelector } from "./BackgroundSelector";
import { AccessorySelector } from "./AccessorySelector";
import { SliderControl } from "./_subcomponents/SliderControl";
import { Button } from "@/components/ui/button";
import { CustomizationParameters, BackgroundType, Style, Accessory } from "@/types/customization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface CustomizationInterfaceProps {
  petId: string;
  initialParameters?: CustomizationParameters;
  availableStyles?: Style[];
  availableAccessories?: Accessory[];
  onSave?: (parameters: CustomizationParameters) => Promise<void>;
  onPreview?: (parameters: CustomizationParameters) => void;
  loading?: boolean;
}

export function CustomizationInterface({
  petId,
  initialParameters,
  availableStyles,
  availableAccessories,
  onSave,
  onPreview,
  loading = false,
}: CustomizationInterfaceProps) {
  // State for customization parameters
  const [parameters, setParameters] = useState<CustomizationParameters>(
    initialParameters || {
      styleId: null,
      background: null,
      accessories: [],
      styleIntensity: 50,
    }
  );

  // State for UI
  const [activeTab, setActiveTab] = useState("style");
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Handlers for parameter changes
  const handleStyleSelect = useCallback((styleId: string) => {
    setParameters((prev) => ({ ...prev, styleId }));
  }, []);

  const handleBackgroundSelect = useCallback(
    (background: { type: BackgroundType; value: string } | null) => {
      setParameters((prev) => ({ ...prev, background }));
    },
    []
  );

  const handleAccessoryToggle = useCallback(
    (accessoryId: string, isSelected: boolean) => {
      setParameters((prev) => ({
        ...prev,
        accessories: isSelected
          ? [...(prev.accessories || []), accessoryId]
          : (prev.accessories || []).filter((id) => id !== accessoryId),
      }));
    },
    []
  );

  const handleIntensityChange = useCallback((value: number) => {
    setParameters((prev) => ({ ...prev, styleIntensity: value }));
  }, []);

  // Handle save and preview actions
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(parameters);
    } catch (error) {
      console.error("Error saving customization:", error);
      // TODO: Add error handling/notification
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!onPreview) return;
    
    setIsPreviewing(true);
    onPreview(parameters);
    // No need to set isPreviewing to false here as the preview rendering will be handled by parent
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Preview Area - Placeholder for now */}
      <div className="lg:w-1/2 order-2 lg:order-1">
        <Card className="p-4">
          <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
            {isPreviewing ? (
              <p className="text-muted-foreground">Generating preview...</p>
            ) : (
              <p className="text-muted-foreground">
                Select options and click "Preview" to see your pet's transformation
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Controls Area */}
      <div className="lg:w-1/2 order-1 lg:order-2">
        <Card className="p-4">
          <Tabs defaultValue="style" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="accessories">Accessories</TabsTrigger>
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4">
              <StyleSelector
                availableStyles={availableStyles || []}
                selectedStyleId={parameters.styleId}
                onStyleSelect={handleStyleSelect}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="background" className="space-y-4">
              <BackgroundSelector
                selectedBackground={parameters.background || null}
                onBackgroundSelect={handleBackgroundSelect}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="accessories" className="space-y-4">
              <AccessorySelector
                availableAccessories={availableAccessories || []}
                selectedAccessoryIds={parameters.accessories || []}
                onAccessoryToggle={handleAccessoryToggle}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="adjust" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Adjust Parameters</h3>
              
              <SliderControl
                id="style-intensity"
                label="Style Intensity"
                value={parameters.styleIntensity || 50}
                min={0}
                max={100}
                step={1}
                onChange={handleIntensityChange}
                valueLabel={(val) => `${val}%`}
              />
              
              {/* Additional adjustment controls can be added here */}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!parameters.styleId || isPreviewing}
            >
              Preview
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!parameters.styleId || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 