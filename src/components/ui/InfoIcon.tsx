'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfoIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Information icon component
 * Used for providing contextual information to users
 */
const InfoIcon = React.forwardRef<HTMLSpanElement, InfoIconProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      default: 'h-4 w-4',
      lg: 'h-5 w-5',
    };
    
    return (
      <span 
        ref={ref}
        className={cn('inline-flex text-blue-500', className)} 
        {...props}
      >
        <Info className={sizeClasses[size]} />
      </span>
    );
  }
);

InfoIcon.displayName = 'InfoIcon';

export { InfoIcon }; 