"use client";

import React, { useRef, useEffect, KeyboardEvent, ReactNode, forwardRef, Ref, ForwardedRef } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutAction } from '@/lib/keyboardShortcuts';
import { cn } from '@/lib/utils';

export interface KeyboardNavigableProps {
  children: ReactNode;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect?: () => void;
  onEscape?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  disabled?: boolean;
  loop?: boolean;
  className?: string;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  customKeyHandlers?: Record<string, () => void>;
}

/**
 * A component that adds standardized keyboard navigation
 * to any complex component according to WAI-ARIA best practices
 */
export const KeyboardNavigable = forwardRef<HTMLDivElement, KeyboardNavigableProps>(({
  children,
  onNavigate,
  onSelect,
  onEscape,
  onHome,
  onEnd,
  disabled = false,
  loop = false,
  className,
  role = "region",
  ariaLabel,
  ariaDescribedBy,
  tabIndex = 0,
  customKeyHandlers = {}
}, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const combinedRef = useCombinedRefs(ref, localRef);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // Handle custom key handlers first
    if (customKeyHandlers && customKeyHandlers[e.key]) {
      e.preventDefault();
      customKeyHandlers[e.key]();
      return;
    }
    
    switch (e.key) {
      case 'ArrowUp':
        if (onNavigate) {
          e.preventDefault();
          onNavigate('up');
        }
        break;
      case 'ArrowDown':
        if (onNavigate) {
          e.preventDefault();
          onNavigate('down');
        }
        break;
      case 'ArrowLeft':
        if (onNavigate) {
          e.preventDefault();
          onNavigate('left');
        }
        break;
      case 'ArrowRight':
        if (onNavigate) {
          e.preventDefault();
          onNavigate('right');
        }
        break;
      case 'Enter':
      case ' ': // Space key
        if (onSelect) {
          e.preventDefault();
          onSelect();
        }
        break;
      case 'Escape':
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        break;
      case 'Home':
        if (onHome) {
          e.preventDefault();
          onHome();
        }
        break;
      case 'End':
        if (onEnd) {
          e.preventDefault();
          onEnd();
        }
        break;
    }
  };
  
  return (
    <div
      ref={combinedRef}
      className={cn("outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={disabled ? -1 : tabIndex}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
});

KeyboardNavigable.displayName = "KeyboardNavigable";

/**
 * A specialized keyboard navigation component for carousels
 * Implements arrow key navigation for slides according to WAI-ARIA practices
 */
export interface KeyboardNavigableCarouselProps {
  children: ReactNode;
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  slideCount: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSelect?: () => void;
  disabled?: boolean;
  loop?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const KeyboardNavigableCarousel = forwardRef<HTMLDivElement, KeyboardNavigableCarouselProps>(({
  children,
  currentSlide,
  setCurrentSlide,
  slideCount,
  onNext,
  onPrevious,
  onSelect,
  disabled = false,
  loop = true,
  className,
  ariaLabel = "Image carousel",
}, ref) => {
  
  const handleNavigate = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (disabled) return;
    
    switch (direction) {
      case 'left':
        if (onPrevious) {
          onPrevious();
        } else {
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
          } else if (loop && slideCount > 0) {
            setCurrentSlide(slideCount - 1);
          }
        }
        break;
      case 'right':
        if (onNext) {
          onNext();
        } else {
          if (currentSlide < slideCount - 1) {
            setCurrentSlide(currentSlide + 1);
          } else if (loop) {
            setCurrentSlide(0);
          }
        }
        break;
      case 'up':
      case 'down':
        // Typically carousels only navigate horizontally
        break;
    }
  };
  
  const handleHome = () => {
    setCurrentSlide(0);
  };
  
  const handleEnd = () => {
    setCurrentSlide(slideCount - 1);
  };
  
  const ariaDescription = `Carousel with ${slideCount} slides. Use left and right arrow keys to navigate between slides. Press Home to go to the first slide, End to go to the last slide.`;
  
  return (
    <KeyboardNavigable
      ref={ref}
      onNavigate={handleNavigate}
      onSelect={onSelect}
      onHome={handleHome}
      onEnd={handleEnd}
      disabled={disabled}
      loop={loop}
      className={className}
      role="region"
      ariaLabel={ariaLabel}
      ariaDescribedBy="carousel-keyboard-instructions"
    >
      <div id="carousel-keyboard-instructions" className="sr-only">
        {ariaDescription}
      </div>
      {children}
    </KeyboardNavigable>
  );
});

KeyboardNavigableCarousel.displayName = "KeyboardNavigableCarousel";

// Helper function to combine refs
function useCombinedRefs<T>(
  externalRef: ForwardedRef<T>,
  localRef: React.RefObject<T>
): React.RefObject<T> {
  useEffect(() => {
    if (!externalRef) return;
    
    if (typeof externalRef === 'function') {
      externalRef(localRef.current);
    } else {
      (externalRef as React.MutableRefObject<T | null>).current = localRef.current;
    }
  }, [externalRef, localRef]);
  
  return localRef;
}

/**
 * Component to enhance a list-like component with keyboard navigation
 */
export function KeyboardNavigableList({
  children,
  currentIndex,
  setCurrentIndex,
  itemCount,
  onItemSelect,
  orientation = "vertical",
  loop = true,
  disabled = false,
  className,
  role = "listbox",
  ariaLabel,
}: {
  children: ReactNode;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  itemCount: number;
  onItemSelect?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  loop?: boolean;
  disabled?: boolean;
  className?: string;
  role?: string;
  ariaLabel?: string;
}) {
  const handleNavigate = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (itemCount === 0) return;
    
    let newIndex = currentIndex;
    
    // Handle navigation based on orientation
    if (orientation === "vertical") {
      if (direction === "up") {
        newIndex = currentIndex - 1;
      } else if (direction === "down") {
        newIndex = currentIndex + 1;
      }
    } else {
      if (direction === "left") {
        newIndex = currentIndex - 1;
      } else if (direction === "right") {
        newIndex = currentIndex + 1;
      }
    }
    
    // Loop around if enabled
    if (loop) {
      if (newIndex < 0) {
        newIndex = itemCount - 1;
      } else if (newIndex >= itemCount) {
        newIndex = 0;
      }
    } else {
      if (newIndex < 0) {
        newIndex = 0;
      } else if (newIndex >= itemCount) {
        newIndex = itemCount - 1;
      }
    }
    
    setCurrentIndex(newIndex);
  };
  
  const handleSelect = () => {
    if (onItemSelect && currentIndex >= 0 && currentIndex < itemCount) {
      onItemSelect(currentIndex);
    }
  };
  
  const handleHome = () => {
    setCurrentIndex(0);
  };
  
  const handleEnd = () => {
    setCurrentIndex(itemCount - 1);
  };
  
  return (
    <KeyboardNavigable
      onNavigate={handleNavigate}
      onSelect={handleSelect}
      onHome={handleHome}
      onEnd={handleEnd}
      disabled={disabled}
      className={className}
      role={role}
      ariaLabel={ariaLabel}
    >
      {children}
    </KeyboardNavigable>
  );
} 