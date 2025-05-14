import { useState, useEffect, useCallback } from 'react';
import { generateStylePreview } from '@/lib/thumbnailService';
import { Style } from '@/types/customization';

interface UseStylePreviewOptions {
  petImageUrl?: string;
  onError?: (error: Error) => void;
  cacheResults?: boolean;
}

interface StylePreviewResult {
  previewUrl: string | null;
  isGenerating: boolean;
  error: Error | null;
  generatePreview: (styleId: string, intensity: number) => Promise<string | null>;
  clearPreview: () => void;
}

// Cache for preview URLs to avoid redundant generation
const previewCache: Record<string, string> = {};

/**
 * Custom hook for generating and managing style previews
 * 
 * @param options Configuration options
 * @returns Object with preview state and methods
 */
export function useStylePreview(options: UseStylePreviewOptions = {}): StylePreviewResult {
  const {
    petImageUrl = '/placeholders/pet-default.jpg',
    onError,
    cacheResults = true
  } = options;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Clear any errors when dependencies change
  useEffect(() => {
    setError(null);
  }, [petImageUrl]);

  // Generate preview for a specific style and intensity
  const generatePreview = useCallback(async (
    styleId: string, 
    intensity: number
  ): Promise<string | null> => {
    if (!styleId) {
      setPreviewUrl(null);
      return null;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Check cache first if enabled
      const cacheKey = `${styleId}_${intensity}_${petImageUrl}`;
      if (cacheResults && previewCache[cacheKey]) {
        setPreviewUrl(previewCache[cacheKey]);
        return previewCache[cacheKey];
      }

      // Generate the preview
      const preview = await generateStylePreview(
        petImageUrl,
        styleId,
        intensity
      );

      // Cache the result if enabled
      if (cacheResults) {
        previewCache[cacheKey] = preview;
      }

      setPreviewUrl(preview);
      return preview;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate preview');
      setError(error);
      setPreviewUrl(null);
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [petImageUrl, cacheResults, onError]);

  // Clear the current preview
  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
  }, []);

  return {
    previewUrl,
    isGenerating,
    error,
    generatePreview,
    clearPreview
  };
} 