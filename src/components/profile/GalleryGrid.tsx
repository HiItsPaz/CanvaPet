'use client';

import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { GalleryPortrait } from '@/types/gallery';
import { cn } from '@/lib/utils';
import { Loader2, ImageIcon } from 'lucide-react';
import GalleryCard from './GalleryCard';

type GridDensity = 'compact' | 'normal' | 'comfortable';

interface GalleryGridProps {
  portraits: GalleryPortrait[];
  isLoading: boolean;
  onFavorite: (id: string, isFavorited: boolean) => Promise<void>;
  onDownload: (url: string, id: string) => void;
  onShare: (id: string, imageUrl: string) => void;
  onRequestRevision: (id: string) => void;
  onSetProfilePic: (portrait: GalleryPortrait) => void;
  onDelete: (id: string) => void;
  density?: GridDensity;
}

export function GalleryGrid({
  portraits,
  isLoading,
  onFavorite,
  onDownload,
  onShare,
  onRequestRevision,
  onSetProfilePic,
  onDelete,
  density = 'normal'
}: GalleryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset cardRefs when portraits change
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, portraits.length);
  }, [portraits]);

  // Get grid columns based on density and screen size
  const getGridClasses = (): string => {
    let baseClasses = "grid gap-4 sm:gap-6 transition-all duration-300";
    
    // Determine column classes based on density
    switch (density) {
      case 'compact':
        return cn(
          baseClasses,
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8"
        );
      case 'comfortable':
        return cn(
          baseClasses,
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        );
      case 'normal':
      default:
        return cn(
          baseClasses,
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        );
    }
  };

  // Get column count based on window width and density
  const getColumnCount = (): number => {
    // This should match the logic in getGridClasses
    if (typeof window === 'undefined') return 4; // Default for SSR
    
    const width = window.innerWidth;
    
    if (density === 'compact') {
      if (width >= 1536) return 8;      // 2xl
      if (width >= 1280) return 6;      // xl
      if (width >= 1024) return 5;      // lg
      if (width >= 768) return 4;       // md
      if (width >= 640) return 3;       // sm
      return 2;                         // base
    } else if (density === 'comfortable') {
      if (width >= 1536) return 5;      // 2xl
      if (width >= 1280) return 4;      // xl
      if (width >= 1024) return 3;      // lg
      if (width >= 768) return 2;       // md
      if (width >= 640) return 2;       // sm
      return 1;                         // base
    } else { // normal
      if (width >= 1536) return 6;      // 2xl
      if (width >= 1280) return 5;      // xl
      if (width >= 1024) return 4;      // lg
      if (width >= 768) return 3;       // md
      if (width >= 640) return 2;       // sm
      return 1;                         // base
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    const totalItems = portraits.length;
    const columns = getColumnCount();
    
    let newIndex = index;
    
    switch(e.key) {
      case 'ArrowRight':
        newIndex = Math.min(index + 1, totalItems - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(index - 1, 0);
        break;
      case 'ArrowDown':
        newIndex = Math.min(index + columns, totalItems - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(index - columns, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = totalItems - 1;
        break;
      default:
        return; // Exit for other keys
    }
    
    if (newIndex !== index) {
      e.preventDefault();
      setFocusedIndex(newIndex);
      cardRefs.current[newIndex]?.focus();
    }
  };

  // Proxy key events from card to grid for navigation
  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    const index = portraits.findIndex(p => p.id === id);
    if (index !== -1) {
      handleKeyDown(e as unknown as KeyboardEvent<HTMLDivElement>, index);
    }
  };

  // Announce loading state for screen readers
  if (isLoading) {
    return (
      <div className="text-center py-4" aria-live="polite" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin inline-block" />
        <span className="sr-only">Loading gallery images</span>
      </div>
    );
  }

  // Announce empty state for screen readers
  if (portraits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12" aria-live="polite">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
        <p className="text-center text-muted-foreground">No portraits found matching your filters.</p>
      </div>
    );
  }

  const columns = getColumnCount();

  return (
    <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-0 animate-fadeIn">
      <div
        ref={gridRef}
        className={getGridClasses()}
        role="grid"
        aria-label="Pet portraits gallery"
        aria-rowcount={Math.ceil(portraits.length / columns)}
        aria-colcount={columns}
        style={{
          "--grid-item-min-width": density === 'comfortable' ? "280px" : density === 'compact' ? "180px" : "220px",
          "--grid-animation-duration": "300ms",
        } as React.CSSProperties}
      >
        {portraits.map((portrait, index) => (
          <GalleryCard
            key={portrait.id}
            ref={(el) => { cardRefs.current[index] = el; }}
            portrait={portrait}
            onFavorite={onFavorite}
            onDownload={onDownload}
            onShare={onShare}
            onRequestRevision={onRequestRevision}
            onSetProfilePic={onSetProfilePic}
            onDelete={onDelete}
            tabIndex={0}
            onKeyDown={handleCardKeyDown}
            animationDelay={index * 30}
            className="grid-card"
          />
        ))}
      </div>
    </div>
  );
} 