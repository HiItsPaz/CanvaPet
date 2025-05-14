"use client";

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { AnimatePresence, motion, MotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

// Animation preset variants
export const TRANSITION_PRESETS = {
  // Fade variants
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  // Slide variants
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  // Scale variants
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  // Pet-themed variants
  petBounce: {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 15 
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { 
        duration: 0.2 
      }
    },
  },
  petWiggle: {
    initial: { opacity: 0, rotate: -5 },
    animate: { 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 15 
      }
    },
    exit: { 
      opacity: 0, 
      rotate: 5,
      transition: { 
        duration: 0.2 
      }
    },
  },
  petSpin: {
    initial: { opacity: 0, rotate: -180, scale: 0.8 },
    animate: { 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 200, 
        damping: 20 
      }
    },
    exit: { 
      opacity: 0, 
      rotate: 180,
      scale: 0.8,
      transition: { 
        duration: 0.3 
      }
    },
  },
};

// Default transition settings for all animations
export const DEFAULT_TRANSITION = {
  duration: 0.2,
  ease: 'easeInOut',
};

// Context for app-wide transition settings
type TransitionContextType = {
  // Global transition settings
  defaultPreset: keyof typeof TRANSITION_PRESETS;
  defaultDuration: number;
  defaultEase: string;
  // Methods to update settings
  setDefaultPreset: (preset: keyof typeof TRANSITION_PRESETS) => void;
  setDefaultDuration: (duration: number) => void;
  setDefaultEase: (ease: string) => void;
};

const TransitionContext = createContext<TransitionContextType>({
  defaultPreset: 'fade',
  defaultDuration: 0.2,
  defaultEase: 'easeInOut',
  setDefaultPreset: () => {},
  setDefaultDuration: () => {},
  setDefaultEase: () => {},
});

export function useTransition() {
  return useContext(TransitionContext);
}

interface TransitionProviderProps {
  children: ReactNode;
  initialPreset?: keyof typeof TRANSITION_PRESETS;
  initialDuration?: number;
  initialEase?: string;
}

export function TransitionProvider({
  children,
  initialPreset = 'fade',
  initialDuration = 0.2,
  initialEase = 'easeInOut',
}: TransitionProviderProps) {
  const [defaultPreset, setDefaultPreset] = useState<keyof typeof TRANSITION_PRESETS>(initialPreset);
  const [defaultDuration, setDefaultDuration] = useState<number>(initialDuration);
  const [defaultEase, setDefaultEase] = useState<string>(initialEase);

  return (
    <TransitionContext.Provider
      value={{
        defaultPreset,
        defaultDuration,
        defaultEase,
        setDefaultPreset,
        setDefaultDuration,
        setDefaultEase,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export interface TransitionProps extends MotionProps {
  /**
   * Element or component to animate
   */
  children: ReactNode;
  /**
   * Unique key for AnimatePresence
   */
  id?: string;
  /**
   * Show or hide the element
   */
  show?: boolean;
  /**
   * Transition preset to use
   */
  preset?: keyof typeof TRANSITION_PRESETS;
  /**
   * Custom variants to override preset
   */
  variants?: any;
  /**
   * Duration for all transitions (in seconds)
   */
  duration?: number;
  /**
   * CSS easing function
   */
  ease?: string;
  /**
   * ClassName for the motion div
   */
  className?: string;
  /**
   * Tag or component to use as the motion element
   */
  as?: React.ElementType;
}

/**
 * Transition component for consistent animations throughout the app
 */
export function Transition({
  children,
  id,
  show = true,
  preset,
  variants,
  duration,
  ease,
  className,
  as: Component = motion.div,
  ...props
}: TransitionProps) {
  const { defaultPreset, defaultDuration, defaultEase } = useTransition();
  const prefersReducedMotion = useReducedMotion();
  
  // Use prop values or fall back to context defaults
  const activePreset = preset || defaultPreset;
  const activeDuration = duration || defaultDuration;
  const activeEase = ease || defaultEase;
  
  // Create transition object
  const transition = {
    duration: prefersReducedMotion ? 0 : activeDuration,
    ease: activeEase,
  };

  // Use custom variants or presets
  const activeVariants = variants || TRANSITION_PRESETS[activePreset];

  // If reduced motion is preferred, use simple fade or no animation
  const accessibleVariants = prefersReducedMotion 
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      } 
    : activeVariants;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <Component
          key={id}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={accessibleVariants}
          transition={transition}
          className={cn(className)}
          {...props}
        >
          {children}
        </Component>
      )}
    </AnimatePresence>
  );
}

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Special transition for page changes
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <Transition
      preset="fade"
      duration={0.3}
      className={cn("w-full", className)}
    >
      {children}
    </Transition>
  );
}

/**
 * Special transition for modal/dialog entrances
 */
export function ModalTransition({ children, className, show = true }: TransitionProps) {
  return (
    <Transition
      preset="scale"
      duration={0.2}
      className={cn(className)}
      show={show}
    >
      {children}
    </Transition>
  );
}

/**
 * Pet-themed transition with playful bounce effect
 */
export function PetTransition({ children, className, preset = "petBounce", show = true, ...props }: TransitionProps) {
  return (
    <Transition
      preset={preset}
      className={cn(className)}
      show={show}
      {...props}
    >
      {children}
    </Transition>
  );
} 