"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { EnhancedLoading } from './animation-library';
import { AnimationTheme } from './processing-animation';

interface ContentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  variant?: 'pet' | 'dog' | 'cat' | 'rabbit' | 'spinner' | 'pulse' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  fullScreen?: boolean;
  minHeight?: string;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that shows an animated loading state when content is loading
 * and renders the children when loading is complete
 */
export function ContentLoader({
  isLoading,
  children,
  loadingText,
  className,
  variant = 'pet',
  size = 'md',
  overlay = true,
  fullScreen = false,
  minHeight = '12rem',
  fallback
}: ContentLoaderProps) {
  // Determine theme based on variant for pet-specific paths
  const getPetTheme = (): AnimationTheme => {
    switch (variant) {
      case 'dog': return 'dog';
      case 'cat': return 'cat';
      case 'rabbit': return 'rabbit';
      default: return 'pet';
    }
  };
  
  if (!isLoading) {
    return <div className={className}>{children}</div>;
  }
  
  // Show fallback if provided
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }
  
  // For spinner, pulse, and dots variants
  if (['spinner', 'pulse', 'dots'].includes(variant)) {
    return (
      <div className={cn(
        "relative flex items-center justify-center",
        !fullScreen && `min-h-[${minHeight}]`,
        className
      )}>
        <EnhancedLoading
          variant={variant as any}
          size={size}
          text={loadingText}
          overlay={overlay}
          fullScreen={fullScreen}
        />
      </div>
    );
  }
  
  // For pet variants
  return (
    <div className={cn(
      "relative flex items-center justify-center",
      !fullScreen && `min-h-[${minHeight}]`,
      className
    )}>
      <EnhancedLoading
        variant={variant}
        size={size}
        text={loadingText}
        overlay={overlay}
        fullScreen={fullScreen}
      />
    </div>
  );
} 