"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2, Cat, Dog, Rabbit } from 'lucide-react';

export interface LoadingAnimationProps {
  /**
   * The type of loading animation to display
   */
  variant?: 'spinner' | 'pulse' | 'dots' | 'pet' | 'dog' | 'cat' | 'rabbit';
  /**
   * The size of the loading animation
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional text to display alongside the loading animation
   */
  text?: string;
  /**
   * Optional CSS class name for the container
   */
  className?: string;
  /**
   * Whether to center the loading animation
   */
  center?: boolean;
}

/**
 * LoadingAnimation component for showing various loading indicators
 */
export function LoadingAnimation({
  variant = 'spinner',
  size = 'md',
  text,
  className,
  center = false,
}: LoadingAnimationProps) {
  // Determine the size values based on the size prop
  const sizeValues = {
    sm: { container: 'h-5 w-5', text: 'text-xs' },
    md: { container: 'h-8 w-8', text: 'text-sm' },
    lg: { container: 'h-12 w-12', text: 'text-base' },
  };

  // Render different loading animations based on the variant
  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={cn("animate-spin text-primary", sizeValues[size].container)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-full w-full" />
          </motion.div>
        );
      case 'pulse':
        return (
          <motion.div
            className={cn("rounded-full bg-primary", sizeValues[size].container)}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        );
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full bg-primary",
                  size === 'sm' ? 'h-1.5 w-1.5' :
                  size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
                )}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );
      case 'pet':
        return (
          <div className="relative">
            <motion.div
              className={cn("text-primary", sizeValues[size].container)}
              animate={{ 
                rotate: [0, 15, 0, -15, 0],
                y: [0, -2, 0, -2, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Cat className="h-full w-full" />
            </motion.div>
            <motion.div
              className="absolute left-0 top-0 h-full w-full bg-gradient-to-t from-background to-transparent opacity-20 rounded-full"
              animate={{ 
                scaleY: [0.8, 1, 0.8],
                opacity: [0.1, 0.3, 0.1],
                y: [2, 0, 2],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
        );
      case 'dog':
        return (
          <div className="relative">
            <motion.div
              className={cn("text-primary", sizeValues[size].container)}
              animate={{
                x: [-4, 4, -4], // Horizontal movement
                y: [0, -2, 0], // Vertical bounce
                rotate: [-5, 5, -5], // Slight rotation for running effect
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Dog className="h-full w-full" />
            </motion.div>
            {/* Running track/shadow */}
            <motion.div
              className="absolute left-0 bottom-0 h-1 w-full bg-primary/20 rounded-full"
              animate={{
                scaleX: [0.8, 1, 0.8],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {/* Dust particles for running effect */}
            <motion.div
              className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-primary/30"
              animate={{
                x: [0, -10, -20],
                opacity: [0.6, 0.2, 0],
                scale: [0.5, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute right-1 bottom-1 h-1 w-1 rounded-full bg-primary/20"
              animate={{
                x: [0, -8, -16],
                opacity: [0.4, 0.2, 0],
                scale: [0.3, 0.8, 0.5],
              }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.2,
              }}
            />
          </div>
        );
      case 'cat':
        return (
          <div className="relative">
            <motion.div
              className={cn("text-primary", sizeValues[size].container)}
              animate={{
                rotate: [0, 10, 0, -10, 0], // Head tilt
                y: [0, -1, 0, -1, 0], // Slight bounce
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Cat className="h-full w-full" />
            </motion.div>
            {/* Paw print appearing effect */}
            <motion.div
              className="absolute -bottom-2 -left-4 h-2 w-2 rounded-full bg-primary/30"
              animate={{
                scale: [0, 1, 1],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1,
              }}
            />
            <motion.div
              className="absolute -bottom-2 -right-4 h-2 w-2 rounded-full bg-primary/30"
              animate={{
                scale: [0, 1, 1],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1,
                delay: 1,
              }}
            />
          </div>
        );
      case 'rabbit':
        return (
          <div className="relative">
            <motion.div
              className={cn("text-primary", sizeValues[size].container)}
              animate={{
                y: [0, -8, 0], // Jumping motion
                scale: [1, 1.1, 1], // Slight scaling for bounce effect
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                times: [0, 0.4, 1], // Control timing of jump
              }}
            >
              <Rabbit className="h-full w-full" />
            </motion.div>
            {/* Shadow that gets smaller when rabbit jumps */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 mx-auto h-1 bg-primary/20 rounded-full"
              style={{ width: '80%' }}
              animate={{
                scale: [1, 0.6, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                times: [0, 0.4, 1],
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3", 
        center && "justify-center",
        className
      )}
    >
      {renderLoadingIndicator()}
      {text && (
        <motion.p 
          className={cn("text-muted-foreground", sizeValues[size].text)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
} 