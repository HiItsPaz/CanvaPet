'use client';

import { useState, useEffect } from 'react';
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

interface RevisionFormProps {
  originalPortraitId: string;
  userId: string;
}

// Define a more specific type instead of any
interface PortraitData {
  id: string;
  user_id: string;
  pet_id: string;
  customization_params?: Record<string, unknown>;
  [key: string]: unknown;
}

export function RevisionForm({ originalPortraitId, userId }: RevisionFormProps) {
  const [originalPortrait, setOriginalPortrait] = useState<PortraitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentParams, setCurrentParams] = useState<Partial<PortraitParameters>>({});
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
          setCurrentParams(data.customization_params as Partial<PortraitParameters>);
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
  }, [originalPortraitId, userId]);

  const handleParamChange = (key: keyof PortraitParameters, value: string | number | boolean) => {
    setCurrentParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitRevision = async () => {
    if (!originalPortrait || !originalPortrait.pet_id || !currentParams) {
      toast({ title: "Error", description: "Missing data to submit revision.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createPortraitRevision(
        originalPortraitId,
        userId,
        originalPortrait.pet_id, // Need pet_id from original portrait
        currentParams as PortraitParameters, // Assume currentParams are complete
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
  };

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
                 value={currentParams.artStyle?.toString() || ''} 
                 onChange={(e) => handleParamChange('artStyle', e.target.value)} 
             />
         </div>
         <div className="space-y-2">
             <Label htmlFor="background">Background Type</Label>
              <Select 
                value={currentParams.background?.toString() || ''} 
                onValueChange={(value) => handleParamChange('background', value)}
              >
                <SelectTrigger id="background">
                  <SelectValue placeholder="Select background type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid-color">Solid Color</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                  {/* Add other types */}
                </SelectContent>
              </Select>
         </div>
          <div className="space-y-2">
             <Label htmlFor="intensity">Style Intensity ({currentParams.styleIntensity || 0})</Label>
             <Slider 
                id="intensity"
                min={0}
                max={100}
                step={1}
                value={[typeof currentParams.styleIntensity === 'number' ? currentParams.styleIntensity : 0]}
                onValueChange={(value) => handleParamChange('styleIntensity', value[0])}
             />
         </div>
          {/* Add controls for other parameters: backgroundOption, orientation, accessories etc. */}
         
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