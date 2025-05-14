"use client";

import React, { useState, useEffect } from 'react';
import { AnimationSystem, MicroInteraction, Animated, PageAnimation } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAnimationPerformance, AnimationOptimizationLevel } from '@/hooks/use-animation-performance';
import { motion } from 'framer-motion';

/**
 * Animation performance demo page
 */
export default function AnimationPerformancePage() {
  // Use the performance hook
  const {
    optimizationLevel,
    isOnBattery,
    currentFps,
    prefersReducedMotion,
    isLowPowerDevice,
    setPerformanceLevel,
    resetPerformanceLevel
  } = useAnimationPerformance({
    enableMonitoring: true,
    monitoringInterval: 1000 // Check every second for demo
  });
  
  // Add stress test state to demonstrate performance impact
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [animationCount, setAnimationCount] = useState<number>(10);
  
  // Performance metrics
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [cpuUsage, setCpuUsage] = useState<number | null>(null);
  
  // Get memory usage if available
  useEffect(() => {
    const checkMemory = () => {
      if ('performance' in window && 'memory' in (performance as any)) {
        const memory = (performance as any).memory;
        setMemoryUsage(Math.round(memory.usedJSHeapSize / (1024 * 1024)));
      }
    };
    
    checkMemory();
    const intervalId = setInterval(checkMemory, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Simulate CPU load for demo purposes
  useEffect(() => {
    if (stressLevel === 0) return;
    
    const load = () => {
      const startTime = performance.now();
      let result = 0;
      
      // Create artificial CPU load based on stress level
      for (let i = 0; i < stressLevel * 1000000; i++) {
        result += Math.sqrt(i);
      }
      
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      
      // Estimate CPU usage based on elapsed time
      const estimatedUsage = Math.min(100, Math.round((elapsedTime / 100) * stressLevel * 10));
      setCpuUsage(estimatedUsage);
    };
    
    const intervalId = setInterval(load, 1000);
    return () => clearInterval(intervalId);
  }, [stressLevel]);
  
  return (
    <div className="container py-10 space-y-10">
      <PageAnimation>
        <h1 className="text-3xl font-bold mb-2">Animation Performance Optimization</h1>
        <p className="text-muted-foreground mb-8">
          Demonstrates how animations are automatically optimized based on device capabilities and performance
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Device & Performance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="font-medium">Optimization Level:</span>
                  <span className={`font-mono ${getOptimizationColor(optimizationLevel)}`}>
                    {optimizationLevel}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Current FPS:</span>
                  <span className={`font-mono ${getFpsColor(currentFps)}`}>
                    {currentFps !== null ? `${currentFps} fps` : 'Measuring...'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Memory Usage:</span>
                  <span className="font-mono">
                    {memoryUsage !== null ? `${memoryUsage} MB` : 'Not available'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Est. CPU Usage:</span>
                  <span className={`font-mono ${getCpuColor(cpuUsage)}`}>
                    {cpuUsage !== null ? `${cpuUsage}%` : 'Not available'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Battery Power:</span>
                  <span className="font-mono">
                    {isOnBattery ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Reduced Motion:</span>
                  <span className="font-mono">
                    {prefersReducedMotion ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Low Power Device:</span>
                  <span className="font-mono">
                    {isLowPowerDevice ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 pt-4">
                <div className="text-sm font-medium mb-1">Force Optimization Level:</div>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    size="sm"
                    variant={optimizationLevel === 'none' ? 'default' : 'outline'}
                    onClick={() => setPerformanceLevel('none')}
                  >
                    None
                  </Button>
                  <Button
                    size="sm"
                    variant={optimizationLevel === 'minimal' ? 'default' : 'outline'}
                    onClick={() => setPerformanceLevel('minimal')}
                  >
                    Minimal
                  </Button>
                  <Button
                    size="sm"
                    variant={optimizationLevel === 'reduced' ? 'default' : 'outline'}
                    onClick={() => setPerformanceLevel('reduced')}
                  >
                    Reduced
                  </Button>
                  <Button
                    size="sm"
                    variant={optimizationLevel === 'disabled' ? 'default' : 'outline'}
                    onClick={() => setPerformanceLevel('disabled')}
                  >
                    Disabled
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={resetPerformanceLevel}
                  className="mt-2"
                >
                  Auto-Detect (Reset)
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Stress Test CPU:</div>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    size="sm"
                    variant={stressLevel === 0 ? 'default' : 'outline'}
                    onClick={() => setStressLevel(0)}
                  >
                    Off
                  </Button>
                  <Button
                    size="sm"
                    variant={stressLevel === 1 ? 'default' : 'outline'}
                    onClick={() => setStressLevel(1)}
                  >
                    Low
                  </Button>
                  <Button
                    size="sm"
                    variant={stressLevel === 3 ? 'default' : 'outline'}
                    onClick={() => setStressLevel(3)}
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={stressLevel === 5 ? 'default' : 'outline'}
                    onClick={() => setStressLevel(5)}
                  >
                    High
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Animation Count:</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={animationCount === 10 ? 'default' : 'outline'}
                    onClick={() => setAnimationCount(10)}
                  >
                    10
                  </Button>
                  <Button
                    size="sm"
                    variant={animationCount === 50 ? 'default' : 'outline'}
                    onClick={() => setAnimationCount(50)}
                  >
                    50
                  </Button>
                  <Button
                    size="sm"
                    variant={animationCount === 100 ? 'default' : 'outline'}
                    onClick={() => setAnimationCount(100)}
                  >
                    100
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="text-sm font-medium mb-2">Performance Visualization:</div>
                
                {/* FPS Meter */}
                <div className="h-6 bg-muted rounded-md overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-300 ${getFpsBarColor(currentFps)}`}
                    style={{ width: `${calculateFpsPercentage(currentFps)}%` }}
                  />
                </div>
                
                {/* Memory Usage Meter */}
                {memoryUsage !== null && (
                  <div className="h-6 bg-muted rounded-md overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all duration-300 ${getMemoryBarColor(memoryUsage)}`}
                      style={{ width: `${Math.min(100, (memoryUsage / 500) * 100)}%` }}
                    />
                  </div>
                )}
                
                {/* CPU Usage Meter */}
                {cpuUsage !== null && (
                  <div className="h-6 bg-muted rounded-md overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getCpuBarColor(cpuUsage)}`}
                      style={{ width: `${cpuUsage}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="continuous">
          <TabsList className="mb-4">
            <TabsTrigger value="continuous">Continuous Animations</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Animations</TabsTrigger>
            <TabsTrigger value="optimized">Optimization Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="continuous" className="space-y-6">
            <p className="text-muted-foreground">
              Continuous animations automatically adjust based on device performance.
              These animations are running with the current optimization level: <strong>{optimizationLevel}</strong>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: animationCount }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg flex justify-center">
                  <MicroInteraction
                    variant="continuous"
                    continuousPreset={i % 3 === 0 ? 'petWiggle' : i % 3 === 1 ? 'petBounce' : 'petTailWag'}
                    className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    {i % 3 === 0 ? '🐶' : i % 3 === 1 ? '🐱' : '🐰'}
                  </MicroInteraction>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="interactive" className="space-y-6">
            <p className="text-muted-foreground">
              Interactive animations are optimized based on device performance.
              Hover over these elements to see the effects with the current optimization level: <strong>{optimizationLevel}</strong>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: Math.min(12, animationCount) }).map((_, i) => (
                <MicroInteraction
                  key={i}
                  variant="hover"
                  hoverPreset={i % 3 === 0 ? 'hoverScale' : i % 3 === 1 ? 'hoverLift' : 'hoverGlow'}
                  className="p-6 border rounded-lg bg-card flex items-center justify-center cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-xl mb-2">
                      {i % 3 === 0 ? '🔍' : i % 3 === 1 ? '🚀' : '✨'}
                    </div>
                    <div className="font-medium">
                      {i % 3 === 0 ? 'Scale Effect' : i % 3 === 1 ? 'Lift Effect' : 'Glow Effect'}
                    </div>
                  </div>
                </MicroInteraction>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="optimized" className="space-y-6">
            <p className="text-muted-foreground mb-6">
              This comparison shows how animations are optimized at each performance level.
              The same animation is displayed with different optimization settings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ComparisonCard title="None (Full)" optimizationLevel="none" />
              <ComparisonCard title="Minimal" optimizationLevel="minimal" />
              <ComparisonCard title="Reduced" optimizationLevel="reduced" />
              <ComparisonCard title="Disabled" optimizationLevel="disabled" />
            </div>
            
            <div className="mt-8 p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-4">Performance Impact Analysis</h3>
              <p className="mb-4">
                Each optimization level makes the following adjustments:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">None (Full)</h4>
                  <p className="text-sm text-muted-foreground">
                    Full animations with no restrictions. Uses maximum CPU/GPU resources.
                    Best visual experience but highest performance impact.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Minimal</h4>
                  <p className="text-sm text-muted-foreground">
                    Slightly simplified animations. Reduced movement distance, slower timings,
                    and fewer animation stages. ~30% performance improvement.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Reduced</h4>
                  <p className="text-sm text-muted-foreground">
                    Significantly reduced animations. Only essential movement, simplified transitions,
                    and minimal continuous animations. ~60% performance improvement.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Disabled</h4>
                  <p className="text-sm text-muted-foreground">
                    Only critical feedback animations. Most animations disabled,
                    simple opacity transitions only. ~90% performance improvement.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PageAnimation>
    </div>
  );
}

// Comparison card component
function ComparisonCard({ 
  title, 
  optimizationLevel 
}: { 
  title: string; 
  optimizationLevel: AnimationOptimizationLevel;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <MicroInteraction
            variant="continuous"
            continuousPreset="petWiggle"
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
            optimizationLevel={optimizationLevel}
          >
            🐶
          </MicroInteraction>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <MicroInteraction
            variant="hover"
            hoverPreset="hoverScale"
            className="p-3 border rounded-lg flex items-center justify-center cursor-pointer"
            optimizationLevel={optimizationLevel}
          >
            Scale
          </MicroInteraction>
          
          <MicroInteraction
            variant="hover"
            hoverPreset="hoverGlow"
            className="p-3 border rounded-lg flex items-center justify-center cursor-pointer"
            optimizationLevel={optimizationLevel}
          >
            Glow
          </MicroInteraction>
        </div>
        
        <Animated
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="p-3 border rounded-lg flex items-center justify-center h-[60px]"
          optimizationLevel={optimizationLevel}
        >
          Custom
        </Animated>
      </CardContent>
    </Card>
  );
}

// Helper functions for color coding
function getOptimizationColor(level: AnimationOptimizationLevel): string {
  switch (level) {
    case 'none': return 'text-green-500';
    case 'minimal': return 'text-blue-500';
    case 'reduced': return 'text-amber-500';
    case 'disabled': return 'text-red-500';
    default: return '';
  }
}

function getFpsColor(fps: number | null): string {
  if (fps === null) return '';
  if (fps >= 55) return 'text-green-500';
  if (fps >= 30) return 'text-amber-500';
  return 'text-red-500';
}

function getCpuColor(cpu: number | null): string {
  if (cpu === null) return '';
  if (cpu <= 30) return 'text-green-500';
  if (cpu <= 70) return 'text-amber-500';
  return 'text-red-500';
}

function getFpsBarColor(fps: number | null): string {
  if (fps === null) return 'bg-muted-foreground';
  if (fps >= 55) return 'bg-green-500';
  if (fps >= 30) return 'bg-amber-500';
  return 'bg-red-500';
}

function getMemoryBarColor(memory: number): string {
  if (memory <= 100) return 'bg-green-500';
  if (memory <= 300) return 'bg-amber-500';
  return 'bg-red-500';
}

function getCpuBarColor(cpu: number | null): string {
  if (cpu === null) return 'bg-muted-foreground';
  if (cpu <= 30) return 'bg-green-500';
  if (cpu <= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

function calculateFpsPercentage(fps: number | null): number {
  if (fps === null) return 0;
  return Math.min(100, (fps / 60) * 100);
} 