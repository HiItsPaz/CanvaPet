"use client";

import React from 'react';
import { AlertCircle, AlertTriangle, XCircle, Info, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ErrorMessageProps {
  title?: string;
  message: string | React.ReactNode;
  severity?: ErrorSeverity;
  recoveryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  additionalActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function ErrorMessage({
  title,
  message,
  severity = 'error',
  recoveryAction,
  secondaryAction,
  additionalActions,
  dismissible = false,
  onDismiss,
  className,
  showIcon = true,
  children,
}: ErrorMessageProps) {
  // Determine icon and styles based on severity
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getContainerStyles = () => {
    switch (severity) {
      case 'error':
        return 'bg-destructive/15 text-destructive border-destructive/50';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50';
      default:
        return 'bg-destructive/15 text-destructive border-destructive/50';
    }
  };

  const getIconStyles = () => {
    switch (severity) {
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-amber-500 dark:text-amber-400';
      case 'info':
        return 'text-blue-500 dark:text-blue-400';
      case 'success':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-destructive';
    }
  };

  const getMainButtonVariant = () => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'outline';
      case 'success':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  return (
    <div 
      className={cn(
        'flex items-start border rounded-md p-4 space-x-3',
        getContainerStyles(),
        className
      )}
      role={severity === 'error' ? 'alert' : 'status'}
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
    >
      {showIcon && (
        <div className={cn('flex-shrink-0 mt-0.5', getIconStyles())}>
          {getIcon()}
        </div>
      )}
      
      <div className="flex-1 space-y-2">
        {title && (
          <h4 className="font-medium">
            {title}
          </h4>
        )}
        <div className="text-sm">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        
        {children && (
          <div className="mt-2">
            {children}
          </div>
        )}
        
        {(recoveryAction || secondaryAction || (additionalActions && additionalActions.length > 0)) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {recoveryAction && (
              <Button 
                variant={getMainButtonVariant()} 
                size="sm" 
                onClick={recoveryAction.onClick}
              >
                {recoveryAction.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            
            {additionalActions && additionalActions.map((action, index) => (
              <Button 
                key={index}
                variant={action.variant || 'outline'} 
                size="sm" 
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {dismissible && (
        <button 
          type="button"
          className="flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 