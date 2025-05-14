'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const formErrorIconVariants = cva(
  'text-destructive rounded-full', 
  {
    variants: {
      size: {
        default: 'h-4 w-4',
        sm: 'h-3 w-3',
        lg: 'h-5 w-5',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        wiggle: 'animate-wiggle',
      }
    },
    defaultVariants: {
      size: 'default',
      animation: 'none',
    },
  }
);

// Add wiggle animation to tailwind config if needed
// animation: {
//   wiggle: 'wiggle 0.5s ease-in-out',
// },
// keyframes: {
//   wiggle: {
//     '0%, 100%': { transform: 'rotate(-3deg)' },
//     '50%': { transform: 'rotate(3deg)' },
//   },
// },

export interface FormErrorIconProps extends VariantProps<typeof formErrorIconVariants> {
  className?: string;
  showTooltip?: boolean;
  tooltipText?: string;
}

/**
 * Form error icon component
 * Displays an animated icon to draw attention to form errors
 */
const FormErrorIcon: React.FC<FormErrorIconProps> = ({
  size,
  animation = 'pulse',
  className,
  showTooltip = false,
  tooltipText = 'This field has an error',
  ...props
}) => {
  return (
    <span 
      className={cn('inline-flex', showTooltip && 'relative group')} 
      aria-hidden="true"
      {...props}
    >
      <AlertCircle className={cn(formErrorIconVariants({ size, animation }), className)} />
      
      {showTooltip && (
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-white bg-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
          {tooltipText}
        </span>
      )}
    </span>
  );
};

FormErrorIcon.displayName = 'FormErrorIcon';

export { FormErrorIcon, formErrorIconVariants }; 