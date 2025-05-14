"use client";

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { MicroInteraction } from './animation-library';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAnimationPerformance } from '@/hooks/use-animation-performance';

export type AnimationPreset = 'scale' | 'lift' | 'glow' | 'pulse' | 'bounce' | 'wiggle' | 'none';

interface AnimatedButtonProps extends ButtonProps {
  animationPreset?: AnimationPreset;
  /**
   * Whether to use a continuous animation (when not in reduced motion mode)
   */
  continuous?: boolean;
  /**
   * The color to use for the glow animation (CSS color string)
   */
  glowColor?: string;
}

/**
 * An enhanced button component with built-in animations
 */
export function AnimatedButton({
  children,
  className,
  animationPreset = 'scale',
  continuous = false,
  glowColor,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const { optimizationLevel } = useAnimationPerformance();
  
  // Skip animations for reduced motion preference or disabled optimization level
  if (prefersReducedMotion || optimizationLevel === 'disabled' || animationPreset === 'none') {
    return (
      <Button 
        className={className}
        disabled={disabled}
        {...props}
      >
        {children}
      </Button>
    );
  }
  
  // For continuous animations like wiggle, bounce, pulse
  if (continuous) {
    // Determine the animation properties based on preset
    const getAnimationProps = () => {
      switch (animationPreset) {
        case 'wiggle':
          return {
            animate: {
              rotate: [0, 1, 0, -1, 0],
            },
            transition: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              repeatDelay: 1,
            }
          };
        case 'bounce':
          return {
            animate: {
              y: [0, -4, 0],
            },
            transition: {
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }
          };
        case 'pulse':
          return {
            animate: {
              scale: [1, 1.03, 1],
            },
            transition: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }
          };
        default:
          return {};
      }
    };
    
    const animationProps = getAnimationProps();
    
    return (
      <motion.div
        className="inline-block"
        {...animationProps}
      >
        <Button 
          className={className}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
  
  // For hover interactions
  let hoverPreset: 'hoverScale' | 'hoverLift' | 'hoverGlow' | undefined;
  
  switch (animationPreset) {
    case 'scale':
      hoverPreset = 'hoverScale';
      break;
    case 'lift':
      hoverPreset = 'hoverLift';
      break;
    case 'glow':
      hoverPreset = 'hoverGlow';
      break;
    default:
      hoverPreset = undefined;
  }
  
  // If using custom glow color
  const customGlowStyle = 
    animationPreset === 'glow' && glowColor 
      ? {
          whileHover: { 
            boxShadow: `0 0 15px ${glowColor}`,
            scale: 1.02
          },
          whileTap: { scale: 1 },
          transition: { duration: 0.2 }
        }
      : undefined;
  
  return (
    <MicroInteraction 
      variant="hover" 
      hoverPreset={hoverPreset}
      disabled={disabled}
      className="inline-block"
      {...(customGlowStyle ? { ...customGlowStyle } : {})}
    >
      <Button 
        className={className}
        disabled={disabled}
        {...props}
      >
        {children}
      </Button>
    </MicroInteraction>
  );
} 