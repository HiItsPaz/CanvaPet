"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MicroInteraction } from './animation-library';
import { cn } from '@/lib/utils';
import { useProcessingState } from '@/hooks/use-processing-state';

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'scale' | 'lift' | 'glow' | 'none';
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  showLoadingState?: boolean;
  target?: string;
  prefetch?: boolean;
  external?: boolean;
  preserveState?: boolean;
  replace?: boolean;
}

/**
 * An animated link component with hover effects and optional loading state
 */
export function AnimatedLink({
  href,
  children,
  className,
  hoverEffect = 'scale',
  onClick,
  showLoadingState = false,
  target,
  prefetch,
  external = false,
  preserveState = false,
  replace = false
}: AnimatedLinkProps) {
  const router = useRouter();
  const [processingState, processingControls] = useProcessingState();
  
  // Map hover effect to preset name
  const hoverPreset = React.useMemo(() => {
    switch (hoverEffect) {
      case 'scale': return 'hoverScale';
      case 'lift': return 'hoverLift';
      case 'glow': return 'hoverGlow';
      default: return undefined;
    }
  }, [hoverEffect]);
  
  // Handle click with optional loading state
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
    
    if (e.defaultPrevented) {
      return;
    }
    
    // Skip if it's an external link
    if (external || target === '_blank') {
      return;
    }
    
    // Show loading state if enabled
    if (showLoadingState) {
      e.preventDefault();
      processingControls.startProcessing();
      
      // Delay navigation slightly to show loading animation
      setTimeout(() => {
        if (replace) {
          router.replace(href, { scroll: true });
        } else {
          router.push(href, { scroll: true });
        }
        
        // Reset state after navigation
        setTimeout(() => {
          processingControls.reset();
        }, 300);
      }, 300);
    }
  }, [href, onClick, router, processingControls, showLoadingState, external, target, replace]);
  
  // If no hover effect, render regular link
  if (hoverEffect === 'none') {
    return (
      <Link
        href={href}
        className={className}
        onClick={handleClick}
        target={target}
        prefetch={prefetch}
      >
        {children}
      </Link>
    );
  }
  
  // Render animated link
  return (
    <MicroInteraction
      variant="hover"
      hoverPreset={hoverPreset}
      className="inline-block"
    >
      <Link
        href={href}
        className={cn("transition-colors", className)}
        onClick={handleClick}
        target={target}
        prefetch={prefetch}
      >
        {children}
      </Link>
    </MicroInteraction>
  );
} 