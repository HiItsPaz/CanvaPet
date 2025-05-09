"use client";

import { useCustomization } from "@/contexts/CustomizationContext";
import { StyleSelector } from "./StyleSelector";
import { BackgroundSelector } from "./BackgroundSelector";
import { AccessorySelector } from "./AccessorySelector";
import { SliderControl } from "./_subcomponents/SliderControl";
import { PreviewDisplay } from "./_subcomponents/PreviewDisplay";
import { ParameterHelpTooltip } from "./_subcomponents/ParameterHelpTooltip";
import { ToggleControl } from "./_subcomponents/ToggleControl";
import { DropdownControl, DropdownOption } from "./_subcomponents/DropdownControl";
import { NumericInputControl } from "./_subcomponents/NumericInputControl";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Palette, Wand2, ToyBrick, Settings2, Undo2, Redo2 } from "lucide-react";
import { CustomizationParameters } from "@/types/customization";

interface CustomizationInterfaceWithContextProps {
  petName?: string;
}

// Help text for different parameters
const HELP_TEXT = {
  styleIntensity: "Adjust how strongly the selected style is applied to your pet's image. Higher values create a more pronounced effect while lower values are more subtle.",
  style: "Choose an artistic style to transform your pet's appearance. Each style applies different visual effects and characteristics to the image.",
  background: "Select a background for your pet portrait. You can choose from solid colors, gradients, or upload a custom image.",
  accessories: "Add fun accessories like hats, glasses, or other items to your pet's portrait. You can select multiple accessories at once.",
  exampleToggle: "This is an example toggle. Use it for boolean (true/false) settings, like enabling or disabling a feature.",
  exampleDropdown: "This is an example dropdown. Use it to select one option from a predefined list, like choosing a frame style or a filter.",
  exampleNumeric: "This is an example numeric input. Use it for settings that require a number, like adjusting brightness or contrast within a specific range.",
};

const frameStyleOptions: DropdownOption[] = [
  { value: "none", label: "No Frame" },
  { value: "simple-black", label: "Simple Black Border" },
  { value: "ornate-gold", label: "Ornate Gold Frame" },
  { value: "rounded-wood", label: "Rounded Wood Frame" },
];

export function CustomizationInterfaceWithContext({ 
  petName = "pet" 
}: CustomizationInterfaceWithContextProps) {
  const {
    parameters,
    availableStyles,
    availableAccessories,
    isLoading,
    isPreviewGenerating,
    isSaving,
    previewUrl,
    selectStyle,
    selectBackground,
    toggleAccessory,
    adjustStyleIntensity,
    updateParameter,
    generatePreview,
    saveCustomization,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCustomization();

  // UI state
  const [activeTab, setActiveTab] = useState("style");
  const [showGuidance, setShowGuidance] = useState(true);

  // Example state for new controls - these would normally be part of `parameters`
  const [exampleToggleState, setExampleToggleState] = useState(false);
  const [exampleDropdownState, setExampleDropdownState] = useState<string | undefined>(frameStyleOptions[0].value);
  const [exampleNumericState, setExampleNumericState] = useState<number | undefined>(25);

  const dismissGuidance = () => setShowGuidance(false);
  
  // Handler for generic parameter updates if not covered by specific setters
  // This is useful if we add more parameters directly to the CustomizationParameters type
  const handleGenericParamChange = <K extends keyof CustomizationParameters>(
    key: K,
    value: CustomizationParameters[K]
  ) => {
    updateParameter(key, value);
  };

  // Example specific handlers - in a real scenario, these might call updateParameter with appropriate keys
  const handleExampleToggleChange = (checked: boolean) => {
    setExampleToggleState(checked);
    // Example: handleGenericParamChange('someBooleanParameter', checked);
  };

  const handleExampleDropdownChange = (value: string) => {
    setExampleDropdownState(value);
    // Example: handleGenericParamChange('someDropdownParameter', value);
  };

  const handleExampleNumericChange = (value: number | undefined) => {
    setExampleNumericState(value);
    // Example: handleGenericParamChange('someNumericParameter', value);
  };

  return (
    <div className="space-y-6">
      {/* User Guidance Alert */}
      {showGuidance && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
          <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300">Customization Guide</AlertTitle>
          <AlertDescription className="mt-2 text-blue-600 dark:text-blue-300/90">
            <p className="mb-2">
              Welcome to the Pet Customizer! Here's how to create a unique portrait for {petName}:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li><strong>Style:</strong> Pick an artistic style (e.g., Cartoon, Watercolor).</li>
              <li><strong>Background:</strong> Choose a backdrop for your pet.</li>
              <li><strong>Accessories:</strong> Add fun items like hats or glasses.</li>
              <li><strong>Adjust:</strong> Fine-tune parameters like style intensity.</li>
              <li>Click <strong>Preview</strong> anytime to see your masterpiece.</li>
              <li>Happy? Click <strong>Save Changes</strong> to keep your work.</li>
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={dismissGuidance} 
              className="mt-3 bg-white dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-blue-200"
            >
              Got it, let's start!
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Preview Area */}
        <div className="lg:w-1/2 order-2 lg:order-1 sticky top-6 self-start">
          <PreviewDisplay
            previewUrl={previewUrl}
            isLoading={isPreviewGenerating}
            onRefresh={generatePreview}
            petName={petName}
          />
        </div>

        {/* Controls Area */}
        <div className="lg:w-1/2 order-1 lg:order-2">
          <Card className="p-4">
            <Tabs defaultValue="style" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="style" className="flex items-center gap-1.5"><Wand2 className="h-4 w-4" /> Style</TabsTrigger>
                <TabsTrigger value="background" className="flex items-center gap-1.5"><Palette className="h-4 w-4" /> Background</TabsTrigger>
                <TabsTrigger value="accessories" className="flex items-center gap-1.5"><ToyBrick className="h-4 w-4" /> Accessories</TabsTrigger>
                <TabsTrigger value="adjust" className="flex items-center gap-1.5"><Settings2 className="h-4 w-4" /> Adjust</TabsTrigger>
              </TabsList>

              <TabsContent value="style" className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Select Style</h3>
                  <ParameterHelpTooltip
                    title="Style Selection"
                    content={HELP_TEXT.style}
                  />
                </div>
                <StyleSelector
                  availableStyles={availableStyles}
                  selectedStyleId={parameters.styleId}
                  onStyleSelect={selectStyle}
                  loading={isLoading}
                />
              </TabsContent>

              <TabsContent value="background" className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Choose Background</h3>
                  <ParameterHelpTooltip
                    title="Background Selection"
                    content={HELP_TEXT.background}
                  />
                </div>
                <BackgroundSelector
                  selectedBackground={parameters.background || null}
                  onBackgroundSelect={selectBackground}
                  loading={isLoading}
                />
              </TabsContent>

              <TabsContent value="accessories" className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Add Accessories</h3>
                  <ParameterHelpTooltip
                    title="Accessories"
                    content={HELP_TEXT.accessories}
                  />
                </div>
                <AccessorySelector
                  availableAccessories={availableAccessories}
                  selectedAccessoryIds={parameters.accessories || []}
                  onAccessoryToggle={toggleAccessory}
                  loading={isLoading}
                />
              </TabsContent>

              <TabsContent value="adjust" className="space-y-6 pt-2">
                <h3 className="text-lg font-semibold -mb-2">Adjust Parameters</h3>
                
                <SliderControl
                  id="style-intensity"
                  label="Style Intensity"
                  value={parameters.styleIntensity || 50}
                  min={0}
                  max={100}
                  step={1}
                  onChange={adjustStyleIntensity}
                  valueLabel={(val) => `${val}%`}
                  helpText={HELP_TEXT.styleIntensity}
                />
                
                {/* Example Controls Section */}
                <div className="pt-2 space-y-4">
                  <h4 className="text-md font-medium text-muted-foreground pb-1 border-b">Example Controls:</h4>
                  <ToggleControl
                    id="example-toggle"
                    label="Example Toggle Option"
                    checked={exampleToggleState}
                    onChange={handleExampleToggleChange}
                    helpText={HELP_TEXT.exampleToggle}
                  />

                  <DropdownControl
                    id="example-dropdown"
                    label="Example Frame Style"
                    options={frameStyleOptions}
                    selectedValue={exampleDropdownState}
                    onValueChange={handleExampleDropdownChange}
                    placeholder="Select a frame"
                    helpText={HELP_TEXT.exampleDropdown}
                  />

                  <NumericInputControl
                    id="example-numeric"
                    label="Example Detail Level (0-100)"
                    value={exampleNumericState}
                    onChange={handleExampleNumericChange}
                    min={0}
                    max={100}
                    step={1}
                    allowDecimals={false}
                    placeholder="Enter a number"
                    helpText={HELP_TEXT.exampleNumeric}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              {/* Undo/Redo Buttons */}
              <div className="flex gap-2">
                  <Button 
                      variant="outline"
                      size="icon"
                      onClick={undo}
                      disabled={!canUndo || isPreviewGenerating || isSaving}
                      aria-label="Undo last change"
                  >
                      <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button 
                      variant="outline"
                      size="icon"
                      onClick={redo}
                      disabled={!canRedo || isPreviewGenerating || isSaving}
                      aria-label="Redo last change"
                  >
                      <Redo2 className="h-4 w-4" />
                  </Button>
              </div>
              
              {/* Preview/Save Buttons */}
              <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={generatePreview}
                    disabled={!parameters.styleId || isPreviewGenerating || isSaving}
                    className="min-w-[100px]"
                  >
                    {isPreviewGenerating ? "Generating..." : "Preview"}
                  </Button>
                  <Button 
                    onClick={saveCustomization}
                    disabled={!parameters.styleId || isSaving || (!previewUrl && !isPreviewGenerating)}
                    className="min-w-[100px]"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 