'use client';

import { ReactCompareSlider } from 'react-compare-slider';
import Image from 'next/image'; // Use next/image for potential optimization
import pixelmatch from 'pixelmatch';
import { useRef, useEffect, useState } from 'react';

interface RevisionComparerProps {
  imageUrl1: string;
  label1?: string;
  imageUrl2: string;
  label2?: string;
  mode?: 'slider' | 'side-by-side' | 'pixel-diff'; // New prop for mode
}

/**
 * RevisionComparer displays two images for visual comparison in different modes:
 * - 'slider': interactive slider (default)
 * - 'side-by-side': static side-by-side view
 * - 'pixel-diff': (placeholder for future pixel-diff implementation)
 */
export function RevisionComparer({ 
    imageUrl1, 
    label1 = 'Version 1',
    imageUrl2, 
    label2 = 'Version 2',
    mode = 'slider', // Default to slider mode
}: RevisionComparerProps) {
  if (!imageUrl1 || !imageUrl2) {
    return <div className="text-center text-destructive p-4">Missing image URLs for comparison.</div>;
  }

  const [diffError, setDiffError] = useState<string | null>(null);
  const [diffReady, setDiffReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode !== 'pixel-diff' || !imageUrl1 || !imageUrl2) return;
    setDiffError(null);
    setDiffReady(false);
    let cancelled = false;

    // Helper to load an image and return ImageData
    function loadImageData(url: string, w: number, h: number): Promise<ImageData> {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('No 2D context');
            ctx.drawImage(img, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h);
            resolve(data);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject('Failed to load image: ' + url);
        img.src = url;
      });
    }

    // Main diff logic
    (async () => {
      try {
        // Load both images to get their sizes
        const img1 = new window.Image();
        const img2 = new window.Image();
        img1.crossOrigin = 'Anonymous';
        img2.crossOrigin = 'Anonymous';
        await Promise.all([
          new Promise((res, rej) => { img1.onload = res; img1.onerror = rej; img1.src = imageUrl1; }),
          new Promise((res, rej) => { img2.onload = res; img2.onerror = rej; img2.src = imageUrl2; })
        ]);
        if (cancelled) return;
        // Use the minimum size for diff
        const w = Math.min(img1.width, img2.width);
        const h = Math.min(img1.height, img2.height);
        if (w === 0 || h === 0) throw new Error('Images have zero width or height');
        // Get image data
        const [data1, data2] = await Promise.all([
          loadImageData(imageUrl1, w, h),
          loadImageData(imageUrl2, w, h)
        ]);
        if (cancelled) return;
        // Prepare output
        const diff = new Uint8ClampedArray(w * h * 4);
        pixelmatch(data1.data, data2.data, diff, w, h, { threshold: 0.1 });
        // Draw diff to canvas
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('No canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2D context');
        const diffImage = new ImageData(diff, w, h);
        ctx.putImageData(diffImage, 0, 0);
        setDiffReady(true);
      } catch (e: any) {
        setDiffError(e?.message || e?.toString() || 'Pixel diff failed');
      }
    })();
    return () => { cancelled = true; };
  }, [mode, imageUrl1, imageUrl2]);

  if (mode === 'side-by-side') {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 aspect-square border rounded-lg overflow-hidden p-2 bg-background">
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Image 
            src={imageUrl1} 
            alt={label1}
            fill
            className="object-contain rounded"
            unoptimized
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {label1}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Image 
            src={imageUrl2} 
            alt={label2}
            fill
            className="object-contain rounded"
            unoptimized
          />
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {label2}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'pixel-diff') {
    return (
      <div className="w-full max-w-2xl mx-auto aspect-square border rounded-lg overflow-hidden flex flex-col items-center justify-center bg-muted p-4">
        <div className="flex w-full justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label1} vs {label2} (Pixel Diff)</span>
        </div>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, background: '#222' }} />
        {diffError && <div className="text-destructive text-xs mt-2">{diffError}</div>}
        {!diffReady && !diffError && <div className="text-xs text-muted-foreground mt-2">Generating diff...</div>}
      </div>
    );
  }

  // Default: slider mode
  return (
    <div className="w-full max-w-2xl mx-auto aspect-square relative border rounded-lg overflow-hidden">
      <ReactCompareSlider
        itemOne={
            <div className="w-full h-full relative">
                <Image 
                    src={imageUrl1} 
                    alt={label1}
                    fill
                    className="object-contain" 
                    unoptimized
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {label1}
                </div>
            </div>
        }
        itemTwo={
             <div className="w-full h-full relative">
                <Image 
                    src={imageUrl2} 
                    alt={label2}
                    fill
                    className="object-contain"
                    unoptimized
                />
                 <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {label2}
                </div>
            </div>
        }
        style={{
             width: '100%', 
             height: '100%'
        }}
      />
    </div>
  );
} 