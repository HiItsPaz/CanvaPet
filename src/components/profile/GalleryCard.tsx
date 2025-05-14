'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Download, 
  Share, 
  Star, 
  Edit, 
  Trash, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GalleryPortrait } from '@/types/gallery';

interface GalleryCardProps {
  portrait: GalleryPortrait;
  onFavorite: (id: string, isFavorited: boolean) => Promise<void>;
  onDownload: (url: string, id: string) => void;
  onShare: (id: string, imageUrl: string) => void;
  onRequestRevision: (id: string) => void;
  onSetProfilePic: (portrait: GalleryPortrait) => void;
  onDelete: (id: string) => void;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, id: string) => void;
  className?: string;
  animationDelay?: number;
}

export const GalleryCard = forwardRef<HTMLDivElement, GalleryCardProps>(
  ({ 
    portrait, 
    onFavorite, 
    onDownload, 
    onShare, 
    onRequestRevision,
    onSetProfilePic,
    onDelete,
    tabIndex = 0,
    onKeyDown,
    className,
    animationDelay = 0
  }, ref) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    
    // Check if this is a mobile device (client-side only)
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const checkMobile = () => {
          setIsMobile(window.innerWidth < 768);
        };
        
        // Initial check
        checkMobile();
        
        // Add event listener for resize
        window.addEventListener('resize', checkMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
      }
    }, []);
    
    // Determine if this portrait is favorited
    const isFavorited = !!portrait.is_favorited;
    
    // Extract tags (with fallback)
    const currentTags = portrait.tags || [];
    
    // Determine if revision is possible (based on purchase status)
    const canRevise = portrait.is_purchased;

    // Get portrait state variables
    const isLoading = portrait.status === 'pending' || portrait.status === 'processing';
    const isFailed = portrait.status === 'failed';
    
    // Helper function to get the appropriate display image URL
    const getDisplayImage = (): string => {
      // Prioritize thumbnail, then generated, then original
      return portrait.image_versions?.thumbnail_512 || 
             portrait.image_versions?.generated_dalle3 || 
             portrait.image_versions?.original ||
             portrait.processed_image_url || 
             portrait.original_image_url || 
             '/placeholder-portrait.jpg';
    };

    // Helper function to get the appropriate download URL
    const getDownloadUrl = (): string => {
      // Prioritize upscaled, then generated
      return portrait.high_res_url || 
             portrait.image_versions?.upscaled_clarity_4x || 
             portrait.image_versions?.upscaled_clarity_2x || 
             portrait.image_versions?.generated_dalle3 ||
             portrait.processed_image_url || 
             portrait.original_image_url || 
             '';
    };

    // Generate descriptive alt text
    const getAltText = (): string => {
      let alt = `Portrait of ${portrait.pets?.name || 'pet'}`;
      if (portrait.customization_params?.style) {
        alt += ` in ${portrait.customization_params.style} style`;
      }
      if (portrait.status !== 'completed') {
        alt += ` (${portrait.status})`;
      }
      return alt;
    };

    // Handle local keyDown events before propagating to parent
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Handle card-specific actions
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Trigger primary action (e.g., show details or enlarge image)
        setIsHovered(true);
      } else if (e.key === 'Escape') {
        setIsHovered(false);
      } else if (onKeyDown) {
        // Propagate other keys to parent for grid navigation
        onKeyDown(e, portrait.id);
      }
    };
    
    // Mobile touch handlers for swipe gestures
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      setTouchStart(e.targetTouches[0].clientX);
    };
    
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
    
    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      
      if (isLeftSwipe) {
        // Handle left swipe (e.g., favorite)
        onFavorite(portrait.id, isFavorited);
      } else if (isRightSwipe) {
        // Handle right swipe (e.g., share)
        onShare(portrait.id, getDisplayImage());
      }
      
      // Reset values
      setTouchStart(null);
      setTouchEnd(null);
    };
    
    // Show controls by default on mobile for better usability
    const showControls = isHovered || isMobile;

    return (
      <div 
        ref={ref}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "transition-all duration-300 transform animate-fadeIn",
          className
        )}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
        style={{
          animationDelay: `${animationDelay}ms`,
        }}
        aria-label={getAltText()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Card 
          className={cn(
            "overflow-hidden group relative h-full",
            "focus-within:ring-2 focus-within:ring-primary", 
            "transition-all duration-300",
            "hover:shadow-md hover:translate-y-[-2px]",
            isMobile && "active:scale-95 touch-manipulation"
          )}
        >
          {/* Favorite Button Overlay */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "absolute top-2 right-2 z-10 h-8 w-8 p-1 rounded-full",
              "bg-black/30 text-white hover:bg-black/50 transition-all",
              isFavorited ? 'text-yellow-400' : 'opacity-0 group-hover:opacity-100 focus:opacity-100',
              showControls ? 'opacity-100' : '',
              isMobile && "h-10 w-10" // Larger touch target on mobile
            )}
            onClick={() => onFavorite(portrait.id, isFavorited)}
            aria-label={isFavorited ? `Remove ${portrait.pets?.name || 'portrait'} from favorites` : `Add ${portrait.pets?.name || 'portrait'} to favorites`}
            aria-pressed={isFavorited}
          >
            <Star className={cn("h-5 w-5", isFavorited ? 'fill-current' : '')} aria-hidden="true" />
          </Button>

          {/* Share Button Overlay (mobile only) */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "absolute top-2 left-2 z-10 h-10 w-10 p-1 rounded-full",
                "bg-black/30 text-white hover:bg-black/50 transition-all"
              )}
              onClick={() => onShare(portrait.id, getDisplayImage())}
              aria-label={`Share ${portrait.pets?.name || 'portrait'}`}
            >
              <Share className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}

          <CardContent className="p-0">
            <div className="aspect-square relative w-full overflow-hidden">
              <div className={cn(
                "absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-0",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                showControls ? 'opacity-100' : ''
              )} />
              
              <Image 
                src={getDisplayImage()}
                alt={getAltText()}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                className={cn(
                  "object-cover w-full h-full",
                  "transition-all duration-500",
                  "group-hover:scale-105",
                  !isImageLoaded && "blur-sm"
                )}
                unoptimized
                loading="lazy"
                onLoadingComplete={() => setIsImageLoaded(true)}
              />
            </div>
          </CardContent>
          
          {/* Card Footer with Info and Actions */}
          <CardFooter className={cn(
            "p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent",
            "absolute bottom-0 left-0 right-0 text-white",
            "transition-all duration-300", 
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
            "group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0",
            "flex justify-between items-center",
            isMobile && "p-3 pb-4" // Extra padding on mobile
          )}>
            <div>
              <p className="font-semibold text-sm truncate">{portrait.pets?.name || 'Untitled'}</p>
              <p className="text-xs opacity-80">
                {portrait.created_at ? formatDistanceToNow(new Date(portrait.created_at), { addSuffix: true }) : 'Unknown date'}
              </p>
              
              {/* Status Badge */}
              <Badge 
                variant={portrait.status === 'completed' ? 'default' : portrait.status === 'failed' ? 'destructive' : 'secondary'} 
                className="mt-1 text-xs px-1.5 py-0.5 h-auto"
              >
                {portrait.status}
              </Badge>
              
              {/* Tags Display */}
              <div 
                className="mt-1 flex flex-wrap gap-1" 
                aria-label={currentTags.length > 0 ? `Tags: ${currentTags.join(', ')}` : 'No tags'}
              >
                {currentTags.slice(0, 2).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-1.5 py-0.5 h-auto bg-black/20 border-white/30 text-white/80"
                  >
                    {tag}
                  </Badge>
                ))}
                {currentTags.length > 2 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs px-1.5 py-0.5 h-auto bg-black/20 border-white/30 text-white/80"
                  >
                    +{currentTags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 text-white hover:bg-white/20",
                    isMobile && "h-10 w-10" // Larger touch target on mobile
                  )}
                  aria-label="Portrait options"
                >
                  <MoreHorizontal className={cn("h-4 w-4", isMobile && "h-5 w-5")} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onFavorite(portrait.id, isFavorited)}>
                  <Star className={cn("h-4 w-4 mr-2", isFavorited ? 'fill-yellow-400 text-yellow-500' : '')} aria-hidden="true" /> 
                  {isFavorited ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDownload(getDownloadUrl(), portrait.id)} 
                  disabled={!getDownloadUrl()}
                >
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(portrait.id, getDisplayImage())}>
                  <Share className="h-4 w-4 mr-2" aria-hidden="true" /> Share
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRequestRevision(portrait.id)} 
                  disabled={!canRevise}
                >
                  <Edit className="h-4 w-4 mr-2" aria-hidden="true" /> Request Revision
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onSetProfilePic(portrait)} 
                  disabled={!portrait.pets?.id}
                >
                  <ImageIcon className="h-4 w-4 mr-2" aria-hidden="true" /> Set as Pet Profile Pic
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(portrait.id)} 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash className="h-4 w-4 mr-2" aria-hidden="true" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
          
          {/* Loading State Overlay */}
          {isLoading && (
            <div 
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-20" 
              aria-live="polite"
            >
              <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden="true" />
              <span className="sr-only">
                {portrait.status === 'pending' ? 'Pending generation' : 'Processing portrait'}
              </span>
            </div>
          )}
          
          {/* Failed State Overlay */}
          {isFailed && (
            <div 
              className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center text-white p-2 z-20" 
              aria-live="polite"
            >
              <AlertCircle className="h-6 w-6 mb-1" aria-hidden="true" />
              <span className="text-xs text-center">Generation Failed</span>
            </div>
          )}
        </Card>
        
        {/* Swipe instruction hint for mobile - only shown initially */}
        {isMobile && (
          <div className="text-xs text-muted-foreground text-center mt-1 opacity-60">
            Swipe left to favorite, right to share
          </div>
        )}
      </div>
    );
  }
);

GalleryCard.displayName = 'GalleryCard';

export default GalleryCard; 