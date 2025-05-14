'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getPortrait } from '@/lib/ai/openai'; // Function to fetch original portrait data
import { createPortraitRevision, PortraitParameters } from '@/lib/ai/openai'; // Revision function
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
// Assuming a reusable customization component exists or creating basic controls here
// import { PortraitCustomizer } from '@/components/customization/PortraitCustomizer'; 
// For now, let's add basic placeholders for controls
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea for accessories if needed

interface RevisionFormProps {
  originalPortraitId: string;
  userId: string;
  currentParameters: Partial<PortraitParameters>;
  onParameterChange: (key: keyof PortraitParameters, value: string | number | boolean | string[]) => void;
}

// Define a more specific type instead of any
interface PortraitData {
  id: string;
  user_id: string;
  pet_id: string;
  customization_params?: Partial<PortraitParameters>;
  [key: string]: unknown;
}

export function RevisionForm({ originalPortraitId, userId, currentParameters, onParameterChange }: RevisionFormProps) {
  const [originalPortrait, setOriginalPortrait] = useState<PortraitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch original portrait data on mount
  useEffect(() => {
    const fetchOriginal = async () => {
      setLoading(true);
      setError(null);
      try {
        // Need to ensure getPortrait fetches necessary fields like customization_params and pet_id
        const data = await getPortrait(originalPortraitId);
        if (!data || data.user_id !== userId) {
          throw new Error("Original portrait not found or access denied.");
        }
        
        // Cast the data to our PortraitData type
        setOriginalPortrait(data as unknown as PortraitData);
        
        // Initialize form with original params, handling null/undefined case
        if (data.customization_params) {
          // setCurrentParameters(data.customization_params as Partial<PortraitParameters>);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load original portrait data.';
        setError(errorMessage);
        console.error("Fetch original error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (originalPortraitId && userId) {
      fetchOriginal();
    }
  }, [originalPortraitId, userId, onParameterChange]);

  const handleSubmitRevision = useCallback(async () => {
    if (!originalPortrait || !originalPortrait.pet_id || !currentParameters) {
      toast({ title: "Error", description: "Missing data to submit revision.", variant: "destructive" });
      return;
    }

    // Basic validation: Check if currentParameters is not empty (assuming some parameters are always needed)
    if (Object.keys(currentParameters).length === 0) {
        toast({ title: "Error", description: "No parameters have been changed or selected.", variant: "destructive" });
        return;
    }

    // Comprehensive validation of required PortraitParameters fields
    const requiredParams: (keyof PortraitParameters)[] = ['artStyle', 'background', 'orientation', 'styleIntensity'];
    for (const param of requiredParams) {
        const value = currentParameters[param];
        // Check for undefined, null, or empty string/array for required fields
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            toast({ title: "Validation Error", description: `${param} is required.`, variant: "destructive" });
            return;
        }
         // Specific validation for styleIntensity range
         if (param === 'styleIntensity' && (typeof value !== 'number' || value < 0 || value > 100)) {
             toast({ title: "Validation Error", description: `Style Intensity must be between 0 and 100.`, variant: "destructive" });
             return;
         }
    }

    // Additional validation for backgroundOption if background requires it
    if (currentParameters.background && currentParameters.background !== 'none' && !currentParameters.backgroundOption) { // Assuming 'none' background doesn't require option
         toast({ title: "Validation Error", description: "Background option is required for the selected background type.", variant: "destructive" });
         return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createPortraitRevision(
        originalPortraitId,
        userId,
        originalPortrait.pet_id, // Need pet_id from original portrait
        currentParameters as PortraitParameters, // Assume currentParams are complete
        undefined, // parentRevisionId - implement later if needed
        undefined // feedback - implement later if needed
      );
      
      toast({ title: "Revision Submitted", description: `Revision generation started (ID: ${result.revisionId}). Check your gallery later.` });
      // Optionally redirect to gallery or revision history page
      router.push('/profile/gallery'); 

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit revision request.';
      setError(errorMessage);
      toast({ title: "Submission Error", description: errorMessage, variant: "destructive" });
      console.error("Submit revision error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [originalPortrait, userId, currentParameters, router, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p>{error}</p>
        {/* Add retry? */}
      </div>
    );
  }

  // Basic form structure - replace with actual customization components
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Revision</CardTitle>
        <p className="text-sm text-muted-foreground">Adjust parameters based on portrait #{originalPortraitId?.substring(0, 8)}...</p>
      </CardHeader>
      <CardContent className="space-y-6">
         {/* Example controls - replace with reusable component if available */}
         <div className="space-y-2">
             <Label htmlFor="artStyle">Art Style</Label>
             <Input 
                 id="artStyle" 
                 value={currentParameters.artStyle?.toString() || ''} 
                 onChange={(e) => onParameterChange('artStyle', e.target.value)} 
             />
              <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => onParameterChange('artStyle', 'realistic')}>Realistic</Button>
                  <Button variant="outline" size="sm" onClick={() => onParameterChange('artStyle', 'cartoon')}>Cartoon</Button>
                  <Button variant="outline" size="sm" onClick={() => onParameterChange('artStyle', 'watercolor')}>Watercolor</Button>
                  {/* Add more styles as needed */}
              </div>
         </div>
         <div className="space-y-2">
             <Label htmlFor="background">Background Type</Label>
              <Select 
                value={currentParameters.background?.toString() || ''} 
                onValueChange={(value) => onParameterChange('background', value)}
              >
                <SelectTrigger id="background">
                  <SelectValue placeholder="Select background type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid-color">Solid Color</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                   <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  {/* Add other types */}
                </SelectContent>
              </Select>
         </div>
          <div className="space-y-2">
             <Label htmlFor="intensity">Style Intensity ({currentParameters.styleIntensity || 0})</Label>
             <Slider 
                id="intensity"
                min={0}
                max={100}
                step={1}
                value={[typeof currentParameters.styleIntensity === 'number' ? currentParameters.styleIntensity : 0]}
                onValueChange={(value) => onParameterChange('styleIntensity', value[0])}
             />
         </div>

         {/* New controls for orientation and accessories */}
         <div className="space-y-2">
             <Label htmlFor="orientation">Orientation</Label>
              <Select 
                value={currentParameters.orientation || ''} 
                onValueChange={(value) => onParameterChange('orientation', value)}
              >
                <SelectTrigger id="orientation">
                  <SelectValue placeholder="Select orientation..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
         </div>
          <div className="space-y-2">
             <Label htmlFor="accessories">Accessories (comma-separated)</Label>
             <Input 
                 id="accessories" 
                 value={(Array.isArray(currentParameters.accessories) ? currentParameters.accessories.join(', ') : '') || ''} 
                 onChange={(e) => onParameterChange('accessories', e.target.value.split(',').map(item => item.trim()))} 
             />
         </div>

          {/* Add controls for other parameters: backgroundOption, colorPalette, textOverlay */}
          {/* Placeholder for backgroundOption, depends on background type */}
          {currentParameters.background && currentParameters.background !== 'none' && ( // Assuming 'none' is not a valid background type
             <div className="space-y-2">
                 <Label htmlFor="backgroundOption">Background Option</Label>
                 <Input
                     id="backgroundOption"
                     value={currentParameters.backgroundOption?.toString() || ''}
                     onChange={(e) => onParameterChange('backgroundOption', e.target.value)}
                     placeholder={`Specify ${currentParameters.background} option...`}
                 />
             </div>
          )}

           {/* Placeholder for colorPalette */}
            <div className="space-y-2">
                 <Label htmlFor="colorPalette">Color Palette</Label>
                 <Input
                     id="colorPalette"
                     value={currentParameters.colorPalette?.toString() || ''}
                     onChange={(e) => onParameterChange('colorPalette', e.target.value)}
                     placeholder="e.g., warm, cool, vibrant"
                 />
             </div>

           {/* Placeholder for textOverlay */}
            <div className="space-y-2">
                 <Label htmlFor="textOverlay">Text Overlay</Label>
                 <Input
                     id="textOverlay"
                     value={currentParameters.textOverlay?.toString() || ''}
                     onChange={(e) => onParameterChange('textOverlay', e.target.value)}
                     placeholder="Text to overlay on the portrait"
                 />
             </div>
         
         <Button 
            onClick={handleSubmitRevision} 
            disabled={isSubmitting || loading}
            className="w-full"
         >
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Generate Revision'}
         </Button>
      </CardContent>
    </Card>
  );
} 