'use client';

import { useState, useEffect } from 'react';
import { getPortrait, getPortraitRevisions } from '@/lib/ai/openai'; // Use any for now
import { Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { RevisionComparer } from './RevisionComparer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { SliderControl } from "@/components/customization/_subcomponents/SliderControl";
import { StyleSelector } from "@/components/customization/StyleSelector";
import { BackgroundSelector } from "@/components/customization/BackgroundSelector";
import { AccessorySelector } from "@/components/customization/AccessorySelector";
import { BackgroundOption, BackgroundType } from "@/types/customization";
import { Accessory, Style } from "@/types/customization";

interface RevisionHistoryProps {
  originalPortraitId: string;
  userId: string;
}

interface PortraitData {
  id: string;
  user_id: string;
  image_versions?: {
    generated_dalle3?: string;
    thumbnail_512?: string;
    original?: string;
    [key: string]: string | undefined;
  };
  created_at?: string | null;
  customization_params?: Record<string, unknown>;
  generated_image_url?: string | null;
  generation_time_seconds?: number | null;
  image_url?: string | null;
  status?: string;
  [key: string]: unknown;
}

interface RevisionData extends PortraitData {
  // Add any revision-specific fields here
  parent_id?: string;
}

// Helper to get a displayable image URL from portrait or revision data
const getRevisionImageUrl = (data: PortraitData | RevisionData): string | null => {
    return data?.image_versions?.generated_dalle3 || data?.image_versions?.thumbnail_512 || data?.image_versions?.original || null;
};

export function RevisionHistory({ originalPortraitId, userId }: RevisionHistoryProps) {
    const [original, setOriginal] = useState<PortraitData | null>(null);
    const [revisions, setRevisions] = useState<RevisionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for comparison
    const [compareItem1, setCompareItem1] = useState<PortraitData | RevisionData | null>(null);
    const [compareItem2, setCompareItem2] = useState<RevisionData | null>(null);
    // New: State for comparison mode
    const [compareMode, setCompareMode] = useState<'slider' | 'side-by-side' | 'pixel-diff'>('slider');
    // Example: local state for all main parameters (in real app, use context or backend)
    const [styleId, setStyleId] = useState<string | null>(null);
    const [background, setBackground] = useState<{ type: BackgroundType; value: string } | null>(null);
    const [accessories, setAccessories] = useState<string[]>([]);
    const [styleIntensity, setStyleIntensity] = useState(50);
    // Example: available options (in real app, fetch from backend or context)
    const availableStyles: Style[] = [
      { id: 'cartoon', name: 'Cartoon' },
      { id: 'watercolor', name: 'Watercolor' },
      { id: 'oil', name: 'Oil Painting' },
    ];
    const availableAccessories: Accessory[] = [
      { id: 'hat', name: 'Hat', thumbnailUrl: '', category: 'hats' },
      { id: 'glasses', name: 'Glasses', thumbnailUrl: '', category: 'glasses' },
      { id: 'bowtie', name: 'Bowtie', thumbnailUrl: '', category: 'collars' },
    ];
    const availableBackgrounds: BackgroundOption[] = [
      { id: 'solid', name: 'Solid Color', type: 'color', value: '#FFFFFF' },
      { id: 'nature', name: 'Nature', type: 'scene', value: 'nature-scene' },
      { id: 'abstract', name: 'Abstract', type: 'pattern', value: 'abstract-pattern' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [originalData, revisionsData] = await Promise.all([
                    getPortrait(originalPortraitId),
                    getPortraitRevisions(originalPortraitId, userId)
                ]);

                if (!originalData || originalData.user_id !== userId) {
                    throw new Error("Original portrait not found or access denied.");
                }
                
                setOriginal(originalData as unknown as PortraitData);
                setRevisions((revisionsData || []) as unknown as RevisionData[]);
                
                // Set initial comparison state (e.g., original vs latest revision)
                setCompareItem1(originalData as unknown as PortraitData);
                if (revisionsData?.length > 0) {
                    setCompareItem2(revisionsData[revisionsData.length - 1] as unknown as RevisionData);
                }

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load revision history.';
                setError(errorMessage);
                console.error("Fetch revision history error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (originalPortraitId && userId) {
            fetchData();
        }
    }, [originalPortraitId, userId]);

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-center text-destructive p-4"><AlertCircle className="mx-auto h-6 w-6 mb-1"/>{error}</div>;
    }

    if (!original) return <p>Could not load original portrait.</p>; // Should be caught by error usually

    const allVersions = [original, ...revisions];

    // Ensure image URLs exist for comparison
    const imageUrl1 = compareItem1 ? getRevisionImageUrl(compareItem1) : null;
    const imageUrl2 = compareItem2 ? getRevisionImageUrl(compareItem2) : null;

    const getVersionLabel = (version: PortraitData | RevisionData, index: number): string => {
        if (index === 0) return "Original";
        return `Revision ${index} (${version.id.substring(0, 4)}...)`;
    };

    return (
        <div className="space-y-6">
            {/* Comparison Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Compare Versions</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Mode Toggle UI */}
                    <div className="flex gap-2 mb-4 justify-center">
                        <Button
                            size="sm"
                            variant={compareMode === 'slider' ? 'default' : 'outline'}
                            aria-pressed={compareMode === 'slider'}
                            onClick={() => setCompareMode('slider')}
                        >
                            Slider
                        </Button>
                        <Button
                            size="sm"
                            variant={compareMode === 'side-by-side' ? 'default' : 'outline'}
                            aria-pressed={compareMode === 'side-by-side'}
                            onClick={() => setCompareMode('side-by-side')}
                        >
                            Side-by-Side
                        </Button>
                        <Button
                            size="sm"
                            variant={compareMode === 'pixel-diff' ? 'default' : 'outline'}
                            aria-pressed={compareMode === 'pixel-diff'}
                            onClick={() => setCompareMode('pixel-diff')}
                        >
                            Pixel Diff
                        </Button>
                    </div>
                    {imageUrl1 && imageUrl2 ? (
                        <RevisionComparer 
                            imageUrl1={imageUrl1}
                            label1={compareItem1 ? getVersionLabel(compareItem1, allVersions.indexOf(compareItem1)) : 'Version 1'}
                            imageUrl2={imageUrl2}
                            label2={compareItem2 ? getVersionLabel(compareItem2, allVersions.indexOf(compareItem2)) : 'Version 2'}
                            mode={compareMode}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            Select two versions below to compare.
                        </div>
                    )}
                    {/* Adjustment Controls */}
                    <div className="mt-8 space-y-6">
                        <h3 className="text-base font-semibold mb-2">Adjust Parameters</h3>
                        <div className="space-y-4">
                          <StyleSelector
                            availableStyles={availableStyles}
                            selectedStyleId={styleId}
                            onStyleSelect={setStyleId}
                            loading={false}
                          />
                          <BackgroundSelector
                            selectedBackground={background}
                            onBackgroundSelect={(bg) => setBackground(bg)}
                            loading={false}
                            availableBackgrounds={availableBackgrounds}
                          />
                          <AccessorySelector
                            availableAccessories={availableAccessories}
                            selectedAccessoryIds={accessories}
                            onAccessoryToggle={(id) => setAccessories((prev) => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])}
                            loading={false}
                          />
                          <SliderControl
                            id="style-intensity-revision"
                            label="Style Intensity"
                            value={styleIntensity}
                            min={0}
                            max={100}
                            step={1}
                            onChange={setStyleIntensity}
                            valueLabel={(v) => `${v}%`}
                            helpText="Adjust how strongly the selected style is applied."
                          />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* History/Selection Section */}
            <Card>
                 <CardHeader>
                    <CardTitle>Version History</CardTitle>
                     <p className="text-sm text-muted-foreground">Select versions to compare above.</p>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {allVersions.map((version, index) => {
                            const imageUrl = getRevisionImageUrl(version);
                            const isSelected1 = compareItem1?.id === version.id;
                            const isSelected2 = compareItem2?.id === version.id;
                            const label = getVersionLabel(version, index);

                            return (
                                <li key={version.id} className={`flex items-center justify-between gap-4 p-3 border rounded-md ${isSelected1 || isSelected2 ? 'bg-muted/50 ring-1 ring-primary' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        {imageUrl ? (
                                            <Image src={imageUrl} alt={label} width={64} height={64} className="rounded object-cover aspect-square" unoptimized/>
                                        ) : (
                                            <div className="w-16 h-16 bg-secondary rounded flex items-center justify-center text-muted-foreground">
                                                 <AlertCircle className="h-5 w-5"/>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Created: {version.created_at ? formatDistanceToNow(new Date(version.created_at), { addSuffix: true }) : 'N/A'}
                                            </p>
                                             {version.status && <Badge variant={version.status === 'completed' ? 'default' : 'secondary'} className="mt-1 text-xs capitalize">{version.status}</Badge>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            size="sm" 
                                            variant={isSelected1 ? "default" : "outline"} 
                                            onClick={() => setCompareItem1(version)}
                                            aria-pressed={isSelected1}
                                        >
                                            Compare A
                                        </Button>
                                         <Button 
                                            size="sm" 
                                            variant={isSelected2 ? "default" : "outline"} 
                                            onClick={() => setCompareItem2(version)}
                                            aria-pressed={isSelected2}
                                            disabled={index === 0 && !isSelected1} // Cannot compare original to itself unless it's already A
                                        >
                                            Compare B
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {revisions.length === 0 && (
                         <p className="text-center text-muted-foreground pt-4">No revisions have been created yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 