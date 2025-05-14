"use client";

import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from './use-reduced-motion';

export interface AnimationPerformanceOptions {
  /**
   * Minimum frames per second before reducing animation quality
   * @default 30
   */
  minFps?: number;
  
  /**
   * Whether to enable periodic performance checks 
   * @default true
   */
  enableMonitoring?: boolean;
  
  /**
   * Interval in milliseconds between performance checks
   * @default 5000
   */
  monitoringInterval?: number;
  
  /**
   * Whether to disable complex animations on battery power
   * @default true
   */
  optimizeOnBattery?: boolean;
}

/**
 * Types of animation optimizations that can be applied
 */
export type AnimationOptimizationLevel = 
  | 'none'      // Full animations
  | 'minimal'   // Reduce animation complexity (fewer particles, simpler motions)
  | 'reduced'   // Significantly reduce animations (essential only)
  | 'disabled'; // Disable all non-essential animations

/**
 * Performance status information
 */
export interface AnimationPerformanceInfo {
  /**
   * Current optimization level based on device performance
   */
  optimizationLevel: AnimationOptimizationLevel;
  
  /**
   * Whether the device is currently on battery power
   */
  isOnBattery: boolean;
  
  /**
   * Current FPS measurement (if available)
   */
  currentFps: number | null;
  
  /**
   * Whether the user has requested reduced motion
   */
  prefersReducedMotion: boolean;
  
  /**
   * Whether the device is likely a low-power device
   */
  isLowPowerDevice: boolean;
}

/**
 * Hook to detect device performance capabilities and recommend animation optimization level
 * 
 * @returns {object} Object containing optimizationLevel
 */
export function useAnimationPerformance(options?: {
  enableMonitoring?: boolean;
  minFps?: number;
  monitoringInterval?: number;
}) {
  const [optimizationLevel, setOptimizationLevel] = useState<AnimationOptimizationLevel>('none');
  const [isOnBattery, setIsOnBattery] = useState<boolean>(false);
  const [currentFps, setCurrentFps] = useState<number | null>(null);
  const [isLowPowerDevice, setIsLowPowerDevice] = useState<boolean>(false);
  
  const prefersReducedMotion = useReducedMotion();
  
  // Default options
  const {
    enableMonitoring = false,
    minFps = 30,
    monitoringInterval = 5000
  } = options || {};
  
  // Function to set performance level manually
  const setPerformanceLevel = (level: AnimationOptimizationLevel) => {
    setOptimizationLevel(level);
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('animation-optimization-level', level);
    }
  };
  
  // Reset to auto-detected level
  const resetPerformanceLevel = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('animation-optimization-level');
    }
    detectPerformanceLevel();
  };
  
  // Detect performance level based on device capabilities
  const detectPerformanceLevel = () => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Check for user preference in localStorage
    const userPreference = localStorage.getItem('animation-optimization-level');
    if (userPreference && ['none', 'minimal', 'reduced', 'disabled'].includes(userPreference)) {
      setOptimizationLevel(userPreference as AnimationOptimizationLevel);
      return;
    }
    
    // Check for battery API support
    if ('getBattery' in navigator) {
      // @ts-ignore - Navigator.getBattery() may not be in all TS definitions
      navigator.getBattery().then((battery: any) => {
        // Set battery status
        setIsOnBattery(battery.dischargingTime !== Infinity);
        
        // If battery is discharging and below 15%, reduce animations
        if (battery.dischargingTime !== Infinity && battery.level < 0.15) {
          setOptimizationLevel('reduced');
          return;
        }
      }).catch(() => {
        // Ignore errors, fallback to device detection
      });
    }
    
    // Check for low-end devices using navigator.hardwareConcurrency
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      setIsLowPowerDevice(true);
      setOptimizationLevel('reduced');
      return;
    }
    
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      // Use minimal optimizations for mobile
      setOptimizationLevel('minimal');
      return;
    }
    
    // Default to no optimizations for desktops
    setOptimizationLevel('none');
  };
  
  // FPS monitoring system
  useEffect(() => {
    if (!enableMonitoring || typeof window === 'undefined') return;
    
    let frameCount = 0;
    let lastTimestamp = performance.now();
    let animationFrameId: number;
    let intervalId: NodeJS.Timeout;
    
    // Frame counter function
    const countFrame = (timestamp: number) => {
      frameCount++;
      animationFrameId = requestAnimationFrame(countFrame);
    };
    
    // Start counting frames
    animationFrameId = requestAnimationFrame(countFrame);
    
    // Calculate FPS periodically
    intervalId = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTimestamp;
      const fps = Math.round((frameCount * 1000) / elapsed);
      
      setCurrentFps(fps);
      
      // If FPS drops below threshold, reduce animations
      if (fps < minFps && optimizationLevel === 'none') {
        setOptimizationLevel('minimal');
      } else if (fps < minFps / 2 && (optimizationLevel === 'none' || optimizationLevel === 'minimal')) {
        setOptimizationLevel('reduced');
      }
      
      // Reset counter
      frameCount = 0;
      lastTimestamp = now;
    }, monitoringInterval);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
    };
  }, [enableMonitoring, minFps, monitoringInterval, optimizationLevel]);
  
  // Run detection on mount
  useEffect(() => {
    detectPerformanceLevel();
  }, []);
  
  return { 
    optimizationLevel,
    isOnBattery,
    currentFps,
    prefersReducedMotion,
    isLowPowerDevice,
    setPerformanceLevel,
    resetPerformanceLevel
  };
}

/**
 * Hook to optimize animation performance based on device capabilities
 * 
 * @param options Performance optimization options
 * @returns Animation performance information and management functions
 */
export function useAnimationPerformanceOptimized({
  minFps = 30,
  enableMonitoring = true,
  monitoringInterval = 5000,
  optimizeOnBattery = true,
}: AnimationPerformanceOptions = {}) {
  const prefersReducedMotion = useReducedMotion();
  
  // Performance state
  const [optimizationLevel, setOptimizationLevel] = useState<AnimationOptimizationLevel>(
    prefersReducedMotion ? 'reduced' : 'none'
  );
  const [isOnBattery, setIsOnBattery] = useState(false);
  const [currentFps, setCurrentFps] = useState<number | null>(null);
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false);
  
  // Detect low power device based on navigator info and screen size
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for low-end devices using various signals
    const isLowEnd = 
      // Check for low memory (if available)
      ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) ||
      // Check for low CPU cores (if available)
      ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4) ||
      // Consider small screens as likely lower-power
      (window.screen.width * window.screen.height < 500000) ||
      // Mobile device detection (simple heuristic)
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    setIsLowPowerDevice(isLowEnd);
    
    // If low-end device, set optimization level immediately
    if (isLowEnd && !prefersReducedMotion) {
      setOptimizationLevel('minimal');
    }
  }, [prefersReducedMotion]);
  
  // Battery status detection
  useEffect(() => {
    if (typeof window === 'undefined' || !optimizeOnBattery) return;
    
    if ('getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        // Set initial battery status
        setIsOnBattery(!battery.charging);
        
        // Listen for battery status changes
        battery.addEventListener('chargingchange', () => {
          setIsOnBattery(!battery.charging);
        });
      });
    }
  }, [optimizeOnBattery]);
  
  // Update optimization level when battery status changes
  useEffect(() => {
    if (prefersReducedMotion) {
      setOptimizationLevel('reduced');
    } else if (isLowPowerDevice && isOnBattery) {
      setOptimizationLevel('reduced');
    } else if (isLowPowerDevice || isOnBattery) {
      setOptimizationLevel('minimal');
    } else if (currentFps !== null && currentFps < minFps) {
      setOptimizationLevel('minimal');
    } else {
      setOptimizationLevel('none');
    }
  }, [prefersReducedMotion, isLowPowerDevice, isOnBattery, currentFps, minFps]);
  
  // FPS monitoring
  useEffect(() => {
    if (typeof window === 'undefined' || !enableMonitoring) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    let frameId: number;
    let intervalId: NodeJS.Timeout;
    
    // Frame counter
    const countFrame = () => {
      frameCount++;
      frameId = requestAnimationFrame(countFrame);
    };
    
    // Start monitoring
    frameId = requestAnimationFrame(countFrame);
    
    // Periodically calculate FPS
    intervalId = setInterval(() => {
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      const currentFps = Math.round((frameCount * 1000) / elapsed);
      
      setCurrentFps(currentFps);
      
      // Reset for next interval
      frameCount = 0;
      lastTime = currentTime;
    }, monitoringInterval);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(intervalId);
    };
  }, [enableMonitoring, monitoringInterval]);
  
  // Force a specific optimization level
  const setPerformanceLevel = (level: AnimationOptimizationLevel) => {
    setOptimizationLevel(level);
  };
  
  // Reset to automatic optimization
  const resetPerformanceLevel = () => {
    if (prefersReducedMotion) {
      setOptimizationLevel('reduced');
    } else if (isLowPowerDevice && isOnBattery) {
      setOptimizationLevel('reduced');
    } else if (isLowPowerDevice || isOnBattery) {
      setOptimizationLevel('minimal');
    } else {
      setOptimizationLevel('none');
    }
  };
  
  return {
    // Performance information
    optimizationLevel,
    isOnBattery,
    currentFps,
    prefersReducedMotion,
    isLowPowerDevice,
    
    // Performance management functions
    setPerformanceLevel,
    resetPerformanceLevel,
    
    // Helper methods
    shouldUseComplexAnimations: optimizationLevel === 'none',
    shouldUseSimpleAnimations: optimizationLevel !== 'disabled',
  };
}

export default useAnimationPerformanceOptimized; 