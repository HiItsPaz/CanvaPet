import { useState, useEffect, useMemo } from 'react';
import { Style } from '@/types/customization';
import { 
  generateStyleThumbnails, 
  ThumbnailSize, 
  preloadStyleThumbnails 
} from '@/lib/thumbnailService';

interface UseThumbnailsOptions {
  size?: ThumbnailSize;
  preload?: boolean;
  generate?: boolean;
  cacheKey?: string;
}

// In-memory cache for thumbnail URLs to avoid redundant generation
const thumbnailCache: Record<string, Record<string, string>> = {};

/**
 * React hook for managing thumbnails for style options
 * 
 * @param styles Array of style objects
 * @param options Configuration options
 * @returns Object with processed styles and loading state
 */
export function useThumbnails(
  styles: Style[],
  options: UseThumbnailsOptions = {}
) {
  const {
    size = "medium",
    preload = true,
    generate = true,
    cacheKey = "default"
  } = options;
  
  const [processedStyles, setProcessedStyles] = useState<Style[]>(styles);
  const [isLoading, setIsLoading] = useState(generate);
  const [error, setError] = useState<Error | null>(null);
  
  // Create a unique cache key based on styles and options
  const cacheKeyFull = useMemo(() => 
    `${cacheKey}_${size}_${styles.map(s => s.id).join('_')}`,
    [cacheKey, size, styles]
  );
  
  // Process thumbnails when styles change
  useEffect(() => {
    if (!styles.length) {
      setProcessedStyles([]);
      setIsLoading(false);
      return;
    }
    
    // Start with cached thumbnails if available
    if (thumbnailCache[cacheKeyFull]) {
      const cachedStyles = styles.map(style => ({
        ...style,
        thumbnailUrl: thumbnailCache[cacheKeyFull][style.id] || style.thumbnailUrl
      }));
      
      setProcessedStyles(cachedStyles);
      
      // If we're not generating, we're done
      if (!generate) {
        setIsLoading(false);
        return;
      }
    }
    
    // Only generate thumbnails if needed
    if (generate) {
      setIsLoading(true);
      
      // Process thumbnails
      generateStyleThumbnails(styles, { size })
        .then(processedStyles => {
          // Update the cache
          if (!thumbnailCache[cacheKeyFull]) {
            thumbnailCache[cacheKeyFull] = {};
          }
          
          processedStyles.forEach(style => {
            if (style.thumbnailUrl) {
              thumbnailCache[cacheKeyFull][style.id] = style.thumbnailUrl;
            }
          });
          
          setProcessedStyles(processedStyles);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error generating thumbnails:', err);
          setError(err);
          setIsLoading(false);
          
          // Use original styles as fallback
          setProcessedStyles(styles);
        });
    }
  }, [styles, cacheKeyFull, generate, size]);
  
  // Preload images if required
  useEffect(() => {
    if (preload && processedStyles.length > 0 && !isLoading) {
      preloadStyleThumbnails(processedStyles);
    }
  }, [processedStyles, preload, isLoading]);
  
  return {
    styles: processedStyles,
    isLoading,
    error
  };
} 