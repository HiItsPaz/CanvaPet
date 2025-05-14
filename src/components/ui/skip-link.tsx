"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  targetId: string;
  className?: string;
}

/**
 * SkipLink component that allows keyboard users to bypass navigation
 * and jump directly to the main content.
 * 
 * It's visually hidden until focused, making it accessible only to keyboard users.
 */
export function SkipLink({ targetId, className }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // Set tabindex to make the element focusable if it isn't already
      if (!target.getAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      
      // Focus and scroll to the target
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Base styles - visually hidden but accessible
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
        // Visual styling when focused
        'focus:bg-primary focus:text-primary-foreground focus:p-3 focus:rounded',
        // Outline and shadow for better visibility
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        className
      )}
    >
      Skip to main content
    </a>
  );
}

export default SkipLink; 