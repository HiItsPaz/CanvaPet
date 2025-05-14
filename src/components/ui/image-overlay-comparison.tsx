'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageOverlayComparisonProps {
  imageUrl1: string; // Current image URL
  imageUrl2: string; // Historical image URL
  // blend: number; // Value between 0 and 1 for blending (0 = image2, 1 = image1)
  // split: number; // Value between 0 and 1 for split position (0 = left edge, 1 = right edge)
}

export function ImageOverlayComparison({
  imageUrl1,
  imageUrl2,
  // blend,
  // split,
}: ImageOverlayComparisonProps) {
    const [blend, setBlend] = useState(0.5); // Initial blend value (50/50) for overlay
    const [split, setSplit] = useState(0.5); // Initial split value (50%) for split view
    const [mode, setMode] = useState<'blend' | 'split'>('blend'); // Toggle between blend and split view modes within overlay

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {/* Image 1 (Current) */}
      <Image
        src={imageUrl1}
        alt="Current version"
        layout="fill"
        objectFit="contain"
        className="absolute inset-0"
      />

      {/* Image 2 (Historical) */}
      {mode === 'blend' && (
           <Image
             src={imageUrl2}
             alt="Historical version"
             layout="fill"
             objectFit="contain"
             className="absolute inset-0"
             style={{ opacity: 1 - blend }} // Control opacity based on blend value
           />
      )}

      {mode === 'split' && (
           <Image
             src={imageUrl2}
             alt="Historical version"
             layout="fill"
             objectFit="contain"
             className="absolute inset-0"
             style={{ clipPath: `inset(0 ${100 - split * 100}% 0 0)` }} // Clip historical image based on split value
           />
      )}

      {/* Controls Container */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 z-10 bg-background/50 p-2 rounded-md flex justify-center items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Mode Toggle Buttons */}
          <Button
              size="sm"
              variant={mode === 'blend' ? 'default' : 'outline'}
              onClick={() => setMode('blend')}
          >
              Blend
          </Button>
           <Button
               size="sm"
               variant={mode === 'split' ? 'default' : 'outline'}
               onClick={() => setMode('split')}
           >
               Split
           </Button>

          {/* Blend Slider */}
          {mode === 'blend' && (
               <input
                 type="range"
                 min="0"
                 max="1"
                 step="0.01"
                 value={blend}
                 onChange={(e) => setBlend(parseFloat(e.target.value))}
                 className="flex-grow"
               />
          )}

          {/* Split Slider */}
          {mode === 'split' && (
               <input
                 type="range"
                 min="0"
                 max="1"
                 step="0.01"
                 value={split}
                 onChange={(e) => setSplit(parseFloat(e.target.value))}
                 className="flex-grow"
               />
          )}
      </div>
    </div>
  );
} 