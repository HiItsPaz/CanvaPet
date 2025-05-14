"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';
import { Icon } from './icon';
import { cn } from '@/lib/utils';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type ResponsiveDebuggerProps = {
  className?: string;
  initiallyExpanded?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOnlyInDevelopment?: boolean;
};

/**
 * A development tool that shows the current viewport size and active breakpoint.
 * Helps with responsive layout development and testing.
 */
export function ResponsiveDebugger({
  className,
  initiallyExpanded = false,
  position = 'bottom-right',
  showOnlyInDevelopment = true,
}: ResponsiveDebuggerProps) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [isDev, setIsDev] = useState(true);

  // Update dimensions and breakpoint on resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initial check for development environment
      setIsDev(process.env.NODE_ENV === 'development');
      
      // Set initial dimensions
      const updateDimensions = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        
        // Update the active breakpoint
        if (window.innerWidth >= BREAKPOINTS['2xl']) {
          setBreakpoint('2xl');
        } else if (window.innerWidth >= BREAKPOINTS.xl) {
          setBreakpoint('xl');
        } else if (window.innerWidth >= BREAKPOINTS.lg) {
          setBreakpoint('lg');
        } else if (window.innerWidth >= BREAKPOINTS.md) {
          setBreakpoint('md');
        } else if (window.innerWidth >= BREAKPOINTS.sm) {
          setBreakpoint('sm');
        } else {
          setBreakpoint('xs');
        }
      };
      
      // Initial call
      updateDimensions();
      
      // Event listener for window resize
      window.addEventListener('resize', updateDimensions);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);

  // Show nothing if we're in production and configured to only show in development
  if (showOnlyInDevelopment && !isDev) {
    return null;
  }

  // Determine the position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Determine the breakpoint icon
  const getBreakpointIcon = () => {
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        return Smartphone;
      case 'md':
        return Tablet;
      case 'lg':
      case 'xl':
        return Monitor;
      case '2xl':
        return Maximize2;
      default:
        return Smartphone;
    }
  };

  // Determine the breakpoint color
  const getBreakpointColor = () => {
    switch (breakpoint) {
      case 'xs':
        return 'text-rose-500 dark:text-rose-400';
      case 'sm':
        return 'text-orange-500 dark:text-orange-400';
      case 'md':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'lg':
        return 'text-green-500 dark:text-green-500';
      case 'xl':
        return 'text-blue-500 dark:text-blue-400';
      case '2xl':
        return 'text-purple-500 dark:text-purple-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      className={cn(
        'fixed z-50 shadow-md rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        positionClasses[position],
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-2 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <Icon 
            icon={getBreakpointIcon()} 
            size="sm" 
            className={cn('transition-colors', getBreakpointColor())} 
          />
          <span className={cn('font-mono text-xs font-bold', getBreakpointColor())}>
            {breakpoint.toUpperCase()}
          </span>
        </div>
        <Icon 
          icon={isExpanded ? ChevronDown : ChevronUp} 
          size="sm" 
          className="text-gray-500 dark:text-gray-400" 
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Viewport:</span>
                <span className="font-mono text-xs font-medium">
                  {width} × {height}px
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active Breakpoint:</span>
                <span className={cn('font-mono text-xs font-medium', getBreakpointColor())}>
                  {breakpoint} (≥{BREAKPOINTS[breakpoint]}px)
                </span>
              </div>
              
              <div className="pt-1 grid grid-cols-6 gap-1">
                {(Object.keys(BREAKPOINTS) as Breakpoint[]).map((bp) => (
                  <div 
                    key={bp}
                    className={cn(
                      'h-1.5 rounded-full transition-colors',
                      breakpoint === bp ? getBreakpointColor() : 'bg-gray-200 dark:bg-gray-700'
                    )}
                    title={`${bp}: ≥${BREAKPOINTS[bp]}px`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * A component that displays the breakpoint colors used by ResponsiveDebugger
 * to help with documentation and visualization of breakpoints.
 */
export function BreakpointLegend() {
  const breakpoints: [Breakpoint, string, string][] = [
    ['xs', 'Mobile', '0-639px'],
    ['sm', 'Small Tablet', '640-767px'],
    ['md', 'Tablet', '768-1023px'],
    ['lg', 'Laptop', '1024-1279px'],
    ['xl', 'Desktop', '1280-1535px'],
    ['2xl', 'Large Screen', '1536px+'],
  ];

  const getColor = (bp: Breakpoint) => {
    switch (bp) {
      case 'xs': return 'bg-rose-500 dark:bg-rose-400';
      case 'sm': return 'bg-orange-500 dark:bg-orange-400';
      case 'md': return 'bg-yellow-500 dark:bg-yellow-400';
      case 'lg': return 'bg-green-500 dark:bg-green-500';
      case 'xl': return 'bg-blue-500 dark:bg-blue-400';
      case '2xl': return 'bg-purple-500 dark:bg-purple-400';
      default: return 'bg-gray-500 dark:bg-gray-400';
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {breakpoints.map(([bp, name, range]) => (
        <div key={bp} className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', getColor(bp))} />
          <div className="text-sm">
            <span className="font-medium">{name}</span>
            <span className="text-muted-foreground ml-1.5 text-xs">({range})</span>
          </div>
        </div>
      ))}
    </div>
  );
} 