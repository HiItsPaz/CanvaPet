"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { m, motion, MotionProps, Variants, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAnimationPerformance, AnimationOptimizationLevel } from '@/hooks/use-animation-performance';
import { LoadingAnimation, LoadingAnimationProps } from './loading-animation';
import { ProcessingAnimation, ProcessingAnimationProps, AnimationTheme } from './processing-animation';
import { Transition, TRANSITION_PRESETS, TransitionProps as TransitionComponentProps } from './transition-system';

// Define extended types for animation properties
interface HoverGlowAnimationProps {
  scale?: number;
  boxShadow?: string;
}

interface TweenTransitionProps {
  type: string;
  duration: number;
}

interface SpringTransitionProps {
  type: string;
  stiffness: number;
  damping: number;
  mass?: number;
}

type TransitionProps = TweenTransitionProps | SpringTransitionProps;

// Animation presets that can be easily consumed throughout the app
export const ANIMATION_PRESETS = {
  // Hover effects
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  },
  hoverLift: {
    whileHover: { y: -4 },
    whileTap: { y: 0 },
    transition: { duration: 0.2 }
  },
  hoverGlow: {
    whileHover: { 
      boxShadow: '0 0 15px rgba(var(--color-primary), 0.5)',
      scale: 1.02
    } as any,
    whileTap: { scale: 1 },
    transition: { duration: 0.2 }
  },
  
  // Continuous animations for ambient motion
  petWiggle: {
    animate: {
      rotate: [0, 1, 0, -1, 0],
    },
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut"
    }
  },
  petBounce: {
    animate: {
      y: [0, -6, 0],
    },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut"
    }
  },
  petTailWag: {
    animate: {
      rotate: [0, 3, 0, -3, 0],
    },
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: "easeInOut"
    }
  },
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  }
};

// Performance-optimized versions of animations
export const OPTIMIZED_ANIMATION_PRESETS: Record<AnimationOptimizationLevel, typeof ANIMATION_PRESETS> = {
  // Full animations - same as original
  'none': ANIMATION_PRESETS,
  
  // Minimal optimizations - simpler animations
  'minimal': {
    ...ANIMATION_PRESETS,
    petWiggle: {
      animate: {
        rotate: [0, 0.5, 0, -0.5, 0], // Reduced rotation
      },
      transition: {
        repeat: Infinity,
        duration: 3, // Slower animation
        ease: "easeInOut"
      }
    },
    petBounce: {
      animate: {
        y: [0, -3, 0], // Reduced movement
      },
      transition: {
        repeat: Infinity,
        duration: 2, // Slower animation
        ease: "easeInOut"
      }
    },
    petTailWag: {
      animate: {
        rotate: [0, 1.5, 0, -1.5, 0], // Reduced rotation
      },
      transition: {
        repeat: Infinity,
        duration: 2, // Slower animation
        ease: "easeInOut"
      }
    },
  },
  
  // Reduced animations - essential only, minimal movement
  'reduced': {
    ...ANIMATION_PRESETS,
    hoverScale: {
      whileHover: { scale: 1.02 }, // Minimal scale
      whileTap: { scale: 0.99 },
      transition: { duration: 0.3 } // Slower for smoother appearance
    },
    hoverLift: {
      whileHover: { y: -2 }, // Minimal movement
      whileTap: { y: 0 },
      transition: { duration: 0.3 }
    },
    hoverGlow: {
      whileHover: { 
        boxShadow: '0 0 8px rgba(var(--color-primary), 0.3)', // Less intense
        scale: 1.01
      } as any,
      whileTap: { scale: 1 },
      transition: { duration: 0.3 }
    },
    petWiggle: {
      // No continuous animation in reduced mode
      animate: {
        rotate: [0, 0, 0, 0, 0], // Fixed rotation to avoid type errors
      },
      transition: {
        repeat: 0,
        duration: 0,
        ease: "easeInOut"
      }
    },
    petBounce: {
      // No continuous animation in reduced mode
      animate: {
        y: [0, 0, 0], // Fixed position to avoid type errors
      },
      transition: {
        repeat: 0,
        duration: 0,
        ease: "easeInOut"
      }
    },
    petTailWag: {
      // No continuous animation in reduced mode
      animate: {
        rotate: [0, 0, 0, 0, 0], // Fixed rotation to avoid type errors
      },
      transition: {
        repeat: 0,
        duration: 0,
        ease: "easeInOut"
      }
    },
    pageTransition: {
      initial: { opacity: 0, y: 0 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 0 },
      transition: { duration: 0.2 }
    }
  },
  
  // Disabled animations - no animations except essential feedback
  'disabled': {
    hoverScale: {
      // Only slight visual feedback for interaction
      whileHover: { scale: 1 },
      whileTap: { scale: 0.99 },
      transition: { duration: 0.1 }
    },
    hoverLift: {
      whileHover: { y: 0 },
      whileTap: { y: 0 },
      transition: { duration: 0 }
    },
    hoverGlow: {
      whileHover: { boxShadow: 'none', scale: 1 } as any,
      whileTap: { boxShadow: 'none', scale: 1 } as any,
      transition: { duration: 0 }
    },
    petWiggle: {
      animate: {
        rotate: [0, 0, 0, 0, 0], // Fixed rotation to avoid type errors
      },
      transition: {
        repeat: 0,
        duration: 0,
        ease: "easeInOut" 
      }
    },
    petBounce: {
      animate: {
        y: [0, 0, 0], // Fixed position to avoid type errors
      },
      transition: {
        repeat: 0,
        duration: 0,
        ease: "easeInOut"
      }
    },
    petTailWag: {
      animate: {
        rotate: [0, 0, 0, 0, 0], // Fixed rotation to avoid type errors
      },
      transition: {
        repeat: 0,
        duration: 0,
        ease: "easeInOut"
      }
    },
    pageTransition: {
      initial: { opacity: 0, y: 0 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 0 },
      transition: { duration: 0.15 }
    }
  }
};

// Spring physics presets for more natural motion
export const SPRING_PRESETS = {
  bounce: {
    type: "spring",
    stiffness: 300,
    damping: 10
  },
  gentle: {
    type: "spring",
    stiffness: 100,
    damping: 15
  },
  wobbly: {
    type: "spring",
    stiffness: 300,
    damping: 8,
    mass: 1
  },
  stiff: {
    type: "spring",
    stiffness: 400,
    damping: 40
  }
};

// Performance-optimized spring presets
export const OPTIMIZED_SPRING_PRESETS: Record<AnimationOptimizationLevel, typeof SPRING_PRESETS> = {
  // Full springs - same as original
  'none': SPRING_PRESETS,
  
  // Minimal optimizations - slightly stiffer springs
  'minimal': {
    bounce: {
      type: "spring",
      stiffness: 350,
      damping: 15
    },
    gentle: {
      type: "spring",
      stiffness: 120,
      damping: 18
    },
    wobbly: {
      type: "spring",
      stiffness: 350,
      damping: 12,
      mass: 1
    },
    stiff: {
      type: "spring",
      stiffness: 450,
      damping: 45
    }
  },
  
  // Reduced springs - much stiffer for fewer calculations
  'reduced': {
    bounce: {
      type: "spring",
      stiffness: 400,
      damping: 25
    },
    gentle: {
      type: "spring",
      stiffness: 200,
      damping: 30
    },
    wobbly: {
      type: "spring",
      stiffness: 400,
      damping: 20,
      mass: 1
    },
    stiff: {
      type: "spring",
      stiffness: 500,
      damping: 50
    }
  },
  
  // Disabled springs - direct transitions
  'disabled': {
    bounce: {
      type: "tween",
      duration: 0.2
    } as any,
    gentle: {
      type: "tween",
      duration: 0.2
    } as any,
    wobbly: {
      type: "tween",
      duration: 0.2
    } as any,
    stiff: {
      type: "tween",
      duration: 0.1
    } as any
  }
};

// Base animation component that applies reduced motion preferences
export interface AnimatedProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  respectReducedMotion?: boolean;
  optimizationLevel?: AnimationOptimizationLevel;
  enableDomAnimation?: boolean;
}

export const Animated = ({ 
  children, 
  className, 
  respectReducedMotion = true,
  optimizationLevel: userOptimizationLevel,
  enableDomAnimation = true,
  ...props 
}: AnimatedProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { optimizationLevel: systemOptimizationLevel } = useAnimationPerformance();
  
  // Use user-provided optimization level or fall back to system-detected level
  const effectiveOptimizationLevel = userOptimizationLevel || systemOptimizationLevel;
  
  const motionProps = useMemo(() => {
    if (prefersReducedMotion && respectReducedMotion) {
      // Simplify animations for reduced motion preference
      return {
        ...props,
        transition: { duration: 0 },
        animate: undefined
      };
    }
    
    if (effectiveOptimizationLevel === 'disabled') {
      // Disable animations
      return {
        ...props,
        whileHover: undefined,
        whileTap: props.whileTap, // Keep tap feedback for usability
        animate: undefined,
        transition: { duration: 0.1 }
      };
    }
    
    return props;
  }, [props, prefersReducedMotion, respectReducedMotion, effectiveOptimizationLevel]);

  // Use LazyMotion to load animation features only when needed
  if (enableDomAnimation) {
    return (
      <LazyMotion features={domAnimation} strict>
        <m.div className={className} {...motionProps}>
          {children}
        </m.div>
      </LazyMotion>
    );
  }
  
  // Use regular motion for simpler animations
  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
};

// Hover animation preset types
type HoverPreset = 'hoverScale' | 'hoverLift' | 'hoverGlow';

// Continuous animation preset types
type ContinuousPreset = 'petWiggle' | 'petBounce' | 'petTailWag';

// Micro-interaction component with preset animations
export interface MicroInteractionProps {
  children: React.ReactNode;
  variant: 'hover' | 'continuous';
  hoverPreset?: HoverPreset;
  continuousPreset?: ContinuousPreset;
  className?: string;
  disabled?: boolean;
  optimizationLevel?: AnimationOptimizationLevel;
}

export const MicroInteraction = ({
  children,
  variant,
  hoverPreset = 'hoverScale',
  continuousPreset = 'petWiggle',
  className,
  disabled = false,
  optimizationLevel: userOptimizationLevel,
}: MicroInteractionProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { optimizationLevel: systemOptimizationLevel } = useAnimationPerformance();
  
  // Use user-provided optimization level or fall back to system-detected level
  const effectiveOptimizationLevel = userOptimizationLevel || systemOptimizationLevel;
  
  const animationProps = useMemo(() => {
    if (disabled || (prefersReducedMotion)) {
      return {};
    }
    
    // Get the appropriate preset based on optimization level
    const presets = OPTIMIZED_ANIMATION_PRESETS[effectiveOptimizationLevel];
    
    if (variant === 'hover') {
      const preset = presets[hoverPreset];
      return {
        whileHover: preset?.whileHover,
        whileTap: preset?.whileTap,
        transition: preset?.transition
      };
    } else {
      const preset = presets[continuousPreset];
      return {
        animate: preset?.animate,
        transition: preset?.transition
      };
    }
  }, [variant, hoverPreset, continuousPreset, disabled, prefersReducedMotion, effectiveOptimizationLevel]);

  // Use LazyMotion for performance optimization
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div 
        className={className}
        {...animationProps}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
};

// Enhanced loading component with overlay and fullscreen options
export interface EnhancedLoadingProps extends Omit<LoadingAnimationProps, 'variant'> {
  variant?: 'pet' | 'dog' | 'cat' | 'rabbit' | 'spinner' | 'pulse' | 'dots';
  overlay?: boolean;
  fullScreen?: boolean;
  text?: string;
  className?: string;
  optimizationLevel?: AnimationOptimizationLevel;
}

export const EnhancedLoading = ({
  variant = 'pet',
  size = 'md',
  overlay = true,
  fullScreen = false,
  text,
  className,
  optimizationLevel: userOptimizationLevel,
}: EnhancedLoadingProps) => {
  const { optimizationLevel: systemOptimizationLevel } = useAnimationPerformance();
  
  // Use user-provided optimization level or fall back to system-detected level
  const effectiveOptimizationLevel = userOptimizationLevel || systemOptimizationLevel;
  
  // Use simpler loading animation on low-power devices
  const optimizedVariant = useMemo(() => {
    if (effectiveOptimizationLevel === 'reduced' || effectiveOptimizationLevel === 'disabled') {
      // Use simpler spinner or pulse on low-power devices instead of pet animations
      return variant === 'pet' || variant === 'dog' || variant === 'cat' || variant === 'rabbit' 
        ? 'spinner' 
        : variant;
    }
    return variant;
  }, [variant, effectiveOptimizationLevel]);

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        overlay && 'bg-background/80 backdrop-blur-sm',
        // Use reduced blur for better performance on low-power devices
        overlay && (effectiveOptimizationLevel === 'reduced' || effectiveOptimizationLevel === 'disabled') && 'backdrop-blur-[2px]',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
        className
      )}
    >
      <LoadingAnimation 
        variant={optimizedVariant as LoadingAnimationProps['variant']}
        size={size}
        text={text}
      />
    </div>
  );
};

// Enhanced processing animation with state management
export interface EnhancedProcessingProps {
  state: 'initial' | 'processing' | 'complete' | 'error';
  progress?: number;
  theme?: AnimationTheme;
  message?: string;
  className?: string;
  optimizationLevel?: AnimationOptimizationLevel;
}

export const EnhancedProcessing = ({
  state,
  progress,
  theme = 'pet',
  message,
  className,
  optimizationLevel: userOptimizationLevel,
}: EnhancedProcessingProps) => {
  const { optimizationLevel: systemOptimizationLevel } = useAnimationPerformance();
  
  // Use user-provided optimization level or fall back to system-detected level
  const effectiveOptimizationLevel = userOptimizationLevel || systemOptimizationLevel;
  
  // Use simpler theme on low-power devices
  const optimizedTheme = useMemo(() => {
    if (effectiveOptimizationLevel === 'reduced' || effectiveOptimizationLevel === 'disabled') {
      // Use default theme instead of pet-specific ones
      return 'pet';
    }
    return theme;
  }, [theme, effectiveOptimizationLevel]);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <ProcessingAnimation 
        state={state}
        theme={optimizedTheme}
        progress={progress}
      />
      
      {message && (
        <p className="text-sm text-center text-muted-foreground">{message}</p>
      )}
      
      {state === 'processing' && progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-right mt-1 text-muted-foreground">{progress}%</p>
        </div>
      )}
    </div>
  );
};

// Page transition animation with pet theme support
export interface PageAnimationProps {
  children: React.ReactNode;
  petTheme?: 'pet' | 'dog' | 'cat' | 'rabbit';
  className?: string;
  optimizationLevel?: AnimationOptimizationLevel;
}

export const PageAnimation = ({
  children,
  petTheme = 'pet',
  className,
  optimizationLevel: userOptimizationLevel,
}: PageAnimationProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { optimizationLevel: systemOptimizationLevel } = useAnimationPerformance();
  
  // Use user-provided optimization level or fall back to system-detected level
  const effectiveOptimizationLevel = userOptimizationLevel || systemOptimizationLevel;
  
  // Define transition properties based on optimization level
  const transitionProps = useMemo(() => {
    if (prefersReducedMotion || effectiveOptimizationLevel === 'disabled') {
      return {};
    }
    
    if (effectiveOptimizationLevel === 'reduced') {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
      };
    }
    
    if (effectiveOptimizationLevel === 'minimal') {
      return {
        initial: { opacity: 0, y: 5 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -5 },
        transition: { duration: 0.25 }
      };
    }
    
    // Default (none) - full animation
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.3 }
    };
  }, [prefersReducedMotion, effectiveOptimizationLevel]);
  
  // Use AnimatePresence for exit animations
  return (
    <AnimatePresence mode="wait">
      <LazyMotion features={domAnimation} strict>
        <m.div
          className={className}
          {...transitionProps}
        >
          {children}
        </m.div>
      </LazyMotion>
    </AnimatePresence>
  );
};

// Animation system export with all components and utilities
export const AnimationSystem = {
  // Components
  Animated,
  MicroInteraction,
  EnhancedLoading,
  EnhancedProcessing,
  PageAnimation,
  Transition,
  
  // Presets and configurations
  presets: ANIMATION_PRESETS,
  optimizedPresets: OPTIMIZED_ANIMATION_PRESETS,
  springs: SPRING_PRESETS,
  optimizedSprings: OPTIMIZED_SPRING_PRESETS,
  transitions: TRANSITION_PRESETS,
  
  // Performance utilities
  useAnimationPerformance
};

export default AnimationSystem; 