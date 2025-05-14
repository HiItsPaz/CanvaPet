'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { BreakpointLegend } from './responsive-debugger';

type ResponsiveTestCardProps = {
  title?: string;
  children: ReactNode;
  showLegend?: boolean;
  animated?: boolean;
  className?: string;
};

/**
 * A card component for displaying and testing responsive behavior.
 * Useful for testing and demonstrating responsive layouts.
 */
export function ResponsiveTestCard({
  title = 'Responsive Test',
  children,
  className,
  showLegend = true,
  animated = true,
  ...props
}: ResponsiveTestCardProps & Omit<HTMLMotionProps<"div">, keyof ResponsiveTestCardProps>) {
  const containerProps = props as unknown; // Use unknown for better type safety
  
  if (animated) {
    return (
      <motion.div
        className={cn(
          'p-6 border rounded-lg shadow-sm bg-background',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            {showLegend && (
              <div className="flex-shrink-0">
                <BreakpointLegend />
              </div>
            )}
          </div>
          
          <div className="border-t pt-4">
            {children}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'p-6 border rounded-lg shadow-sm bg-background',
        className
      )}
      {...containerProps}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {showLegend && (
            <div className="flex-shrink-0">
              <BreakpointLegend />
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * A component that conditionally renders content based on the current breakpoint.
 * Useful for testing and demonstrating responsive behavior.
 */
export function ResponsiveContent({
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  fallback = null
}: {
  xs?: ReactNode;
  sm?: ReactNode;
  md?: ReactNode;
  lg?: ReactNode;
  xl?: ReactNode;
  xxl?: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <>
      {/* xs: mobile (<640px) */}
      <div className="sm:hidden">
        {xs !== undefined ? xs : fallback}
      </div>
      
      {/* sm: small tablets (≥640px) */}
      <div className="hidden sm:block md:hidden">
        {sm !== undefined ? sm : xs !== undefined ? xs : fallback}
      </div>
      
      {/* md: tablets (≥768px) */}
      <div className="hidden md:block lg:hidden">
        {md !== undefined ? md : sm !== undefined ? sm : xs !== undefined ? xs : fallback}
      </div>
      
      {/* lg: laptops (≥1024px) */}
      <div className="hidden lg:block xl:hidden">
        {lg !== undefined ? lg : md !== undefined ? md : sm !== undefined ? sm : xs !== undefined ? xs : fallback}
      </div>
      
      {/* xl: desktops (≥1280px) */}
      <div className="hidden xl:block 2xl:hidden">
        {xl !== undefined ? xl : lg !== undefined ? lg : md !== undefined ? md : sm !== undefined ? sm : xs !== undefined ? xs : fallback}
      </div>
      
      {/* 2xl: large screens (≥1536px) */}
      <div className="hidden 2xl:block">
        {xxl !== undefined ? xxl : xl !== undefined ? xl : lg !== undefined ? lg : md !== undefined ? md : sm !== undefined ? sm : xs !== undefined ? xs : fallback}
      </div>
    </>
  );
} 