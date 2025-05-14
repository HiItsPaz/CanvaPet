"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useAnimationPerformance } from '@/hooks/use-animation-performance';

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  animateOnScroll?: boolean;
  threshold?: number; // Visibility threshold for scroll animation (0-1)
  id?: string;
}

/**
 * A component that adds animated transitions to sections within a page
 */
export function SectionTransition({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  animateOnScroll = false,
  threshold = 0.1,
  id
}: SectionTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const { optimizationLevel } = useAnimationPerformance();
  const [isVisible, setIsVisible] = React.useState(!animateOnScroll);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  
  // Set up scroll observer if animateOnScroll is true
  React.useEffect(() => {
    if (!animateOnScroll || !sectionRef.current) return;
    
    const currentSection = sectionRef.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, no need to keep observing
          observer.unobserve(currentSection);
        }
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -100px 0px'
      }
    );
    
    observer.observe(currentSection);
    
    return () => {
      observer.unobserve(currentSection);
    };
  }, [animateOnScroll, threshold]);
  
  // Skip animation if reduced motion is preferred or animations are disabled
  if (prefersReducedMotion || optimizationLevel === 'disabled') {
    return <div className={className} id={id}>{children}</div>;
  }
  
  // Define direction-based variants
  const getVariants = () => {
    // For reduced optimization, use simpler animations
    if (optimizationLevel === 'reduced' || optimizationLevel === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            duration: duration * 0.8, 
            delay 
          }
        }
      };
    }
    
    // Full animations
    switch (direction) {
      case 'up':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration, 
              delay
            }
          }
        };
      case 'down':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration, 
              delay
            }
          }
        };
      case 'left':
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { 
              duration, 
              delay
            }
          }
        };
      case 'right':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { 
              duration, 
              delay
            }
          }
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { 
              duration, 
              delay
            }
          }
        };
    }
  };
  
  const variants = getVariants();
  
  return (
    <div ref={sectionRef} id={id}>
      <AnimatePresence>
        <motion.div
          className={cn(className)}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          exit="hidden"
          variants={variants}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 