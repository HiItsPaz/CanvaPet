"use client";

import React from 'react';
import { Button, ButtonProps } from './button';
import { MicroInteraction } from './animation-library';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface FormSubmitButtonProps extends Omit<ButtonProps, 'disabled'> {
  state?: SubmitState;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showIcon?: boolean;
  disableWhenSubmitting?: boolean;
  resetStateAfter?: number;
  onStateReset?: () => void;
}

/**
 * Enhanced submit button component with built-in animation states for form submission
 */
export function FormSubmitButton({
  children,
  state = 'idle',
  loadingText,
  successText,
  errorText,
  className,
  showIcon = true,
  disableWhenSubmitting = true,
  resetStateAfter,
  onStateReset,
  ...props
}: FormSubmitButtonProps) {
  // Auto-reset the state after specified time if provided
  React.useEffect(() => {
    if ((state === 'success' || state === 'error') && resetStateAfter) {
      const timer = setTimeout(() => {
        onStateReset?.();
      }, resetStateAfter);
      
      return () => clearTimeout(timer);
    }
  }, [state, resetStateAfter, onStateReset]);
  
  // Determine button text based on state
  const buttonText = React.useMemo(() => {
    switch (state) {
      case 'submitting':
        return loadingText || 'Submitting...';
      case 'success':
        return successText || 'Success';
      case 'error':
        return errorText || 'Error';
      default:
        return children;
    }
  }, [state, loadingText, successText, errorText, children]);
  
  // Get appropriate icon based on state
  const icon = React.useMemo(() => {
    if (!showIcon) return null;
    
    switch (state) {
      case 'submitting':
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="mr-2 h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  }, [state, showIcon]);
  
  // Determine button variant and style based on state
  const buttonStyles = React.useMemo(() => {
    switch (state) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'error':
        return 'bg-destructive hover:bg-destructive/90 text-destructive-foreground';
      default:
        return '';
    }
  }, [state]);
  
  const isDisabled = disableWhenSubmitting && state === 'submitting';
  
  return (
    <MicroInteraction
      variant="hover"
      hoverPreset="hoverScale"
      disabled={isDisabled}
      className="inline-block"
    >
      <Button
        className={cn(buttonStyles, className)}
        disabled={isDisabled}
        {...props}
      >
        {icon}
        {buttonText}
      </Button>
    </MicroInteraction>
  );
} 