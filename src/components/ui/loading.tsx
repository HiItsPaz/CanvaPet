import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCcw, AlertCircle } from 'lucide-react';

/**
 * Loading Spinner Component
 * 
 * A simple spinner with size and color variants
 */
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'ghost';
  label?: string;
}

export function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  className,
  ...props
}: SpinnerProps) {
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variantMap = {
    default: 'text-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    ghost: 'text-gray-300 dark:text-gray-600',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <Loader2
        className={cn(
          'animate-spin',
          sizeMap[size],
          variantMap[variant]
        )}
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      {!label && <span className="sr-only">Loading...</span>}
    </div>
  );
}

/**
 * Loading State Component
 * 
 * A flexible container for showing loading states with different visualizations
 */
interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  loadingIcon?: 'spinner' | 'progress' | 'pulse';
  variant?: 'overlay' | 'inline' | 'replace';
  spinnerSize?: SpinnerProps['size'];
  fallback?: React.ReactNode;
}

export function LoadingState({
  isLoading,
  children,
  loadingText = 'Loading...',
  loadingIcon = 'spinner',
  variant = 'overlay',
  spinnerSize = 'md',
  fallback,
  className,
  ...props
}: LoadingStateProps) {
  // Directly render children if not loading
  if (!isLoading) {
    return <>{children}</>;
  }

  // For replace variant, render only loading indicator
  if (variant === 'replace') {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-4 rounded-md',
          className
        )}
        {...props}
      >
        {fallback || (
          <div className="flex flex-col items-center gap-2">
            <Spinner size={spinnerSize} label={loadingText} />
          </div>
        )}
      </div>
    );
  }

  // For inline variant, render both
  if (variant === 'inline') {
    return (
      <div className={cn('relative', className)} {...props}>
        <div className="mb-2">
          <Spinner size={spinnerSize} label={loadingText} />
        </div>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // Default overlay variant
  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-md z-10">
        <div className="bg-card p-4 rounded-lg shadow-lg">
          <Spinner size={spinnerSize} label={loadingText} />
        </div>
      </div>
    </div>
  );
}

/**
 * Refresh Indicator for Pull-to-Refresh
 * 
 * Shows a refreshing indicator, useful for pull-to-refresh interactions
 */
interface RefreshIndicatorProps {
  isRefreshing: boolean;
  progress?: number; // 0 to 100
}

export function RefreshIndicator({
  isRefreshing,
  progress = 0,
}: RefreshIndicatorProps) {
  if (!isRefreshing && progress === 0) return null;

  return (
    <div className="flex items-center justify-center h-16">
      {isRefreshing ? (
        <Spinner label="Refreshing..." />
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCcw
            className={cn(
              'h-4 w-4 transition-transform',
              progress > 70 && 'rotate-180'
            )}
            style={{
              transform: `rotate(${(progress / 100) * 360}deg)`,
            }}
          />
          <span className="text-sm">
            {progress > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Loading Button Component
 * 
 * A button that shows a loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Spinner
          size="xs"
          variant="ghost"
          className="absolute left-2"
        />
      )}
      <span className={cn(isLoading && 'pl-2')}>
        {isLoading && loadingText ? loadingText : children}
      </span>
    </button>
  );
}

/**
 * Skeleton Component
 * 
 * A skeleton loader for content placeholders
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'rectangle';
  height?: string;
  width?: string;
  animate?: boolean;
}

export function Skeleton({
  variant = 'line',
  height,
  width,
  animate = true,
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted rounded-md',
        animate && 'animate-pulse',
        variant === 'circle' && 'rounded-full',
        variant === 'line' && 'h-4 w-full',
        className
      )}
      style={{
        height: height || (variant === 'circle' ? '3rem' : undefined),
        width: width || (variant === 'circle' ? '3rem' : undefined),
      }}
      {...props}
    />
  );
}

/**
 * Skeletal Card
 * 
 * A card with skeleton content for loading states
 */
export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circle" height="3rem" width="3rem" />
        <div className="space-y-2 flex-1">
          <Skeleton height="1.25rem" width="50%" />
          <Skeleton height="0.875rem" width="80%" />
        </div>
      </div>
      <Skeleton height="6rem" />
      <div className="flex justify-between">
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="1.5rem" width="20%" />
      </div>
    </div>
  );
}

/**
 * Skeletal Table
 * 
 * A table with skeleton rows for loading states
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/30 p-4">
        <Skeleton height="1.25rem" width="60%" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex justify-between items-center">
            <div className="space-y-2 w-full">
              <Skeleton height="1rem" width="40%" />
              <Skeleton height="0.75rem" width="70%" />
            </div>
            <Skeleton height="2rem" width="4rem" className="shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading Error
 * 
 * A component to display loading errors with retry functionality
 */
interface LoadingErrorProps {
  message: string;
  onRetry?: () => void;
}

export function LoadingError({ message, onRetry }: LoadingErrorProps) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center space-x-3">
      <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
      <div className="flex-1 text-sm">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-background hover:bg-muted px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Loading Progress
 * 
 * A progress bar for tracking loading status
 */
interface LoadingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  label?: string;
}

export function LoadingProgress({
  progress,
  size = 'md',
  showPercentage = false,
  label,
  className,
  ...props
}: LoadingProgressProps) {
  const sizeMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-1 w-full', className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(progress)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className="bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
} 