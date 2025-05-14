'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { RevisionForm } from '@/components/revision/RevisionForm';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui';
import { Row, Column } from '@/components/ui/flex';
import { ZoomablePreviewDisplay } from '@/components/ui/zoomable-preview-display';
import { ImagePreview } from '@/components/ui/image-preview';
import { getPortrait, getPortraitRevisions, PortraitParameters } from '@/lib/ai/openai';
import { GalleryPortrait } from '@/types/gallery';
import { usePortraitRevisionHistory } from '@/hooks/usePortraitRevisionHistory';
import { PortraitRevision } from '@/lib/ai/openai';
import { ImageOverlayComparison } from '@/components/ui/image-overlay-comparison';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RevisePortraitPage() {
    const params = useParams();
    const portraitId = params.portraitId as string;
    const { user, loading: authLoading } = useAuth();

    const { present, past, setInitialHistory, undo, redo, canUndo, canRedo, addVersion, setPresentVersion } = usePortraitRevisionHistory();

    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comparisonMode, setComparisonMode] = useState<'none' | 'side-by-side' | 'overlay'>('none');
    const [selectedComparisonVersionId, setSelectedComparisonVersionId] = useState<string | undefined>(undefined);
    const [currentParameters, setCurrentParameters] = useState<Partial<PortraitParameters>>({});

    useEffect(() => {
        if (portraitId && user?.id) {
            const fetchData = async () => {
                setLoadingData(true);
                setError(null);
                try {
                    const originalData = await getPortrait(portraitId);
                    if (!originalData) {
                        throw new Error('Original portrait not found.');
                    }

                    const revisionData = await getPortraitRevisions(portraitId, user.id);

                    setInitialHistory(originalData as GalleryPortrait, revisionData);
                    setCurrentParameters((originalData as GalleryPortrait)?.customization_params as Partial<PortraitParameters> || {});

                } catch (err: any) {
                    setError(err.message || 'Failed to load portrait data.');
                    console.error("Error fetching data for revision:", err);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        } else if (!authLoading && !user) {
            setError('You must be logged in to revise a portrait.');
            setLoadingData(false);
        } else if (!portraitId) {
            setError('Invalid Portrait ID.');
            setLoadingData(false);
        }
    }, [portraitId, user, authLoading, setInitialHistory]);

    // Set initial selected comparison version to the most recent historical version
    useEffect(() => {
        if (past.length > 0) {
            setSelectedComparisonVersionId(past[past.length - 1].id);
        } else {
            setSelectedComparisonVersionId(undefined);
        }
    }, [past]);

    // Update currentParameters when present changes due to undo/redo
    useEffect(() => {
        if (present) {
            setCurrentParameters(present.customization_params as Partial<PortraitParameters> || {});
        }
    }, [present]);

    const selectedComparisonVersion = useMemo(() => past.find(v => v.id === selectedComparisonVersionId), [past, selectedComparisonVersionId]);

    const handleParameterChange = useCallback((key: keyof PortraitParameters, value: string | number | boolean | string[]) => {
        setCurrentParameters(prev => {
            const newParams = { ...prev, [key]: value };
            if (present) {
                addVersion({ ...present, customization_params: newParams as Record<string, unknown> });
            }
            return newParams;
        });
    }, [present, addVersion]);

    if (authLoading || loadingData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
         return (
             <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-lg font-semibold">Authentication Required</p>
                    <p className="text-sm">You must be logged in to request a revision.</p>
                    <Link href={`/auth/signin?redirect=/portraits/${portraitId}/revise`} passHref>
                        <Button className="mt-4">Log In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (error || !present) {
         return (
             <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                 <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                 <h1 className="text-2xl font-bold mb-2">Error Loading Portrait Data</h1>
                 <p className="text-muted-foreground mb-6">{String(error || 'No portrait data available.')}</p>
                 <Link href="/profile/gallery" passHref>
                     <Button variant="outline">Back to Gallery</Button>
                 </Link>
             </div>
         );
    }

    return (
        <Container className="py-8 px-4 md:px-6 max-w-screen-xl">
            <Column className="gap-6">
                <h1 className="text-3xl font-bold">Revise Portrait</h1>
                <Row className="gap-6 flex-col lg:flex-row">
                    {/* Main Portrait Display (None Comparison) */}
                    {comparisonMode === 'none' && present?.processed_image_url && (
                         <Column className="lg:w-1/2">
                             <ZoomablePreviewDisplay
                                 imageUrl={present.processed_image_url}
                                 alt={`Portrait ${present.id}`}
                                 title={`Version ${present.id.substring(0, 8)}`}
                                 description={`ID: ${present.id}`}
                                 maxHeight={600}
                             />
                         </Column>
                    )}

                    {/* Comparison Views */}
                    {comparisonMode !== 'none' && present?.processed_image_url && selectedComparisonVersion?.processed_image_url && (
                         <Column className="lg:w-1/2">
                             {comparisonMode === 'side-by-side' && (
                                  <Row className="gap-4 h-full">
                                      {/* Historical Version */}
                                      <Column className="w-1/2">
                                          <ImagePreview
                                              imageUrl={selectedComparisonVersion.processed_image_url!}
                                              alt={`Historical Portrait Version ${selectedComparisonVersion.id.substring(0, 8)}`}
                                          />
                                      </Column>
                                      {/* Current Version */}
                                      <Column className="w-1/2">
                                          <ImagePreview
                                              imageUrl={present.processed_image_url!}
                                              alt={`Current Portrait Version ${present.id.substring(0, 8)}`}
                                          />
                                      </Column>
                                  </Row>
                             )}

                             {comparisonMode === 'overlay' && (
                                  <ImageOverlayComparison
                                      imageUrl1={present.processed_image_url!}
                                      imageUrl2={selectedComparisonVersion.processed_image_url!}
                                  />
                             )}
                         </Column>
                    )}

                    <Column className="lg:w-1/2">
                        <RevisionForm 
                            originalPortraitId={portraitId} 
                            userId={user.id} 
                            currentParameters={currentParameters} 
                            onParameterChange={handleParameterChange}
                        />
                    </Column>
                </Row>
                <Row className="mt-4 justify-center gap-4 items-center">
                    <Button onClick={undo} disabled={!canUndo}>Undo</Button>
                    <Button onClick={redo} disabled={!canRedo}>Redo</Button>

                    {/* Version Select and Compare Buttons */}
                    {past.length > 0 && (
                         <>
                             <Select onValueChange={(versionId) => {
                                 setSelectedComparisonVersionId(versionId);
                                 setPresentVersion(versionId);
                             }} value={selectedComparisonVersionId}>
                                 <SelectTrigger className="w-[180px]">
                                     <SelectValue placeholder="Select version" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {past.map((version) => (
                                          <SelectItem key={version.id} value={version.id}>
                                              Version {version.id.substring(0, 8)}
                                          </SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>

                             <Button onClick={() => setComparisonMode('side-by-side')} disabled={!selectedComparisonVersionId || comparisonMode === 'side-by-side'}>
                                 Side-by-Side
                             </Button>
                              <Button onClick={() => setComparisonMode('overlay')} disabled={!selectedComparisonVersionId || comparisonMode === 'overlay'}>Overlay</Button>
                             <Button onClick={() => setComparisonMode('none')} disabled={comparisonMode === 'none'}>Hide Comparison</Button>
                         </>
                    )}

                </Row>
            </Column>
        </Container>
    );
} 