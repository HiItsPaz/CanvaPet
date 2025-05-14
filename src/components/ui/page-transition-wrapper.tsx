"use client";

import React from 'react';
import { PageAnimation } from './animation-library';
import { usePathname } from 'next/navigation';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  petTheme?: 'pet' | 'dog' | 'cat' | 'rabbit';
}

/**
 * A wrapper component that adds page transitions to any page content
 * To be used in layout.tsx files or directly in page components
 */
export function PageTransitionWrapper({
  children,
  className,
  petTheme
}: PageTransitionWrapperProps) {
  const pathname = usePathname();
  
  // Determine pet theme based on URL path if not explicitly provided
  const determinedTheme = petTheme || determineThemeFromPath(pathname);
  
  return (
    <PageAnimation 
      petTheme={determinedTheme}
      className={className}
    >
      {children}
    </PageAnimation>
  );
}

/**
 * Determines the appropriate pet theme based on the current URL path
 */
function determineThemeFromPath(path: string): 'pet' | 'dog' | 'cat' | 'rabbit' {
  // Check for specific paths and assign appropriate themes
  if (path.includes('/pets')) {
    return 'pet';
  } else if (path.includes('/dog') || path.includes('/merch')) {
    return 'dog';
  } else if (path.includes('/cat') || path.includes('/portraits')) {
    return 'cat';
  } else if (path.includes('/profile')) {
    return 'rabbit';
  }
  
  // Default theme
  return 'pet';
} 