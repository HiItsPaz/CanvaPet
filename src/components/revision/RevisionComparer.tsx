'use client';

import { ReactCompareSlider } from 'react-compare-slider';
import Image from 'next/image'; // Use next/image for potential optimization

interface RevisionComparerProps {
  imageUrl1: string;
  label1?: string;
  imageUrl2: string;
  label2?: string;
}

export function RevisionComparer({ 
    imageUrl1, 
    label1 = 'Version 1',
    imageUrl2, 
    label2 = 'Version 2' 
}: RevisionComparerProps) {

  // Simple error handling for missing URLs
  if (!imageUrl1 || !imageUrl2) {
    return <div className="text-center text-destructive p-4">Missing image URLs for comparison.</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto aspect-square relative border rounded-lg overflow-hidden">
      <ReactCompareSlider
        itemOne={
            // Using a wrapper div might help with layout/object-fit if next/image fill is tricky
            <div className="w-full h-full relative">
                <Image 
                    src={imageUrl1} 
                    alt={label1}
                    fill
                    className="object-contain" 
                    unoptimized // Necessary if URLs are external/Supabase storage
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
             // Add any other custom styles if needed
        }}
      />
    </div>
  );
} 