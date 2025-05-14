"use client";

import React, { useState } from 'react';
import { 
  AnimationSystem, 
  LoadingAnimation, 
  ProcessingAnimation,
  MicroInteraction,
  Animated,
  PageAnimation,
  EnhancedLoading,
  EnhancedProcessing
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useProcessingState } from '@/hooks/use-processing-state';

/**
 * Demo page for the animation system
 */
export default function AnimationDemoPage() {
  const [activeTheme, setActiveTheme] = useState<'pet' | 'dog' | 'cat' | 'rabbit'>('pet');
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [processingState, processingControls] = useProcessingState();

  const handleStartProcessing = () => {
    processingControls.startProcessing();
    
    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      processingControls.updateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        processingControls.completeProcessing();
      }
    }, 500);
  };
  
  const handleResetProcessing = () => {
    processingControls.reset();
  };
  
  const handleErrorProcessing = () => {
    processingControls.failProcessing(new Error("Demo error"));
  };

  return (
    <div className="container py-10 space-y-10">
      <PageAnimation petTheme={activeTheme}>
        <h1 className="text-3xl font-bold mb-2">Animation System Demo</h1>
        <p className="text-muted-foreground mb-8">
          Showcase of the available animation components and presets
        </p>
        
        <Tabs defaultValue="loading">
          <TabsList className="mb-4">
            <TabsTrigger value="loading">Loading Animations</TabsTrigger>
            <TabsTrigger value="processing">Processing Animations</TabsTrigger>
            <TabsTrigger value="micro">Micro Interactions</TabsTrigger>
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="loading" className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Basic Loading Animations</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <Card title="Default Spinner">
                  <LoadingAnimation variant="spinner" size="md" />
                </Card>
                <Card title="Pulse">
                  <LoadingAnimation variant="pulse" size="md" />
                </Card>
                <Card title="Dots">
                  <LoadingAnimation variant="dots" size="md" />
                </Card>
                <Card title="Default Pet">
                  <LoadingAnimation variant="pet" size="md" />
                </Card>
                <Card title="Dog">
                  <LoadingAnimation variant="dog" size="md" />
                </Card>
                <Card title="Cat">
                  <LoadingAnimation variant="cat" size="md" />
                </Card>
                <Card title="Rabbit">
                  <LoadingAnimation variant="rabbit" size="md" />
                </Card>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Enhanced Loading</h2>
              
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="fullScreen" 
                    checked={showFullScreen}
                    onCheckedChange={setShowFullScreen}
                  />
                  <label htmlFor="fullScreen">Full Screen</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch 
                    id="overlay" 
                    checked={showOverlay}
                    onCheckedChange={setShowOverlay}
                  />
                  <label htmlFor="overlay">Show Overlay</label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card title="Enhanced Loading">
                  <div className="h-40 relative">
                    <EnhancedLoading 
                      variant={activeTheme} 
                      fullScreen={false} 
                      overlay={showOverlay} 
                      text="Loading pet data..."
                    />
                  </div>
                </Card>
                
                <Card title="Theme Selection">
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant={activeTheme === 'pet' ? 'default' : 'outline'} 
                      onClick={() => setActiveTheme('pet')}
                      className="justify-start"
                    >
                      Default Pet
                    </Button>
                    <Button 
                      variant={activeTheme === 'dog' ? 'default' : 'outline'} 
                      onClick={() => setActiveTheme('dog')}
                      className="justify-start"
                    >
                      Dog
                    </Button>
                    <Button 
                      variant={activeTheme === 'cat' ? 'default' : 'outline'} 
                      onClick={() => setActiveTheme('cat')}
                      className="justify-start"
                    >
                      Cat
                    </Button>
                    <Button 
                      variant={activeTheme === 'rabbit' ? 'default' : 'outline'} 
                      onClick={() => setActiveTheme('rabbit')}
                      className="justify-start"
                    >
                      Rabbit
                    </Button>
                  </div>
                </Card>
                
                <Card title="Full Screen Demo">
                  <Button 
                    onClick={() => {
                      setShowFullScreen(true);
                      setTimeout(() => setShowFullScreen(false), 2000);
                    }}
                    className="w-full"
                  >
                    Show Full Screen for 2s
                  </Button>
                </Card>
              </div>
              
              {showFullScreen && (
                <EnhancedLoading 
                  variant={activeTheme} 
                  fullScreen={true} 
                  overlay={showOverlay} 
                  text="Loading pet data..."
                />
              )}
            </section>
          </TabsContent>
          
          <TabsContent value="processing" className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Processing Animation Demo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card title="Processing Controls">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Button onClick={handleStartProcessing}>Start Processing</Button>
                      <Button onClick={handleResetProcessing} variant="outline">Reset</Button>
                      <Button onClick={handleErrorProcessing} variant="destructive">Error</Button>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm mb-1 font-medium">Current Status: {processingState.status}</p>
                      <p className="text-sm mb-1">Progress: {processingState.progress ?? 0}%</p>
                      <p className="text-sm">Message: {processingState.message}</p>
                    </div>
                  </div>
                </Card>
                
                <Card title="Processing Animation">
                  <EnhancedProcessing
                    state={processingState.status}
                    progress={processingState.progress}
                    theme={activeTheme}
                    className="p-6"
                  />
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card title="Initial State">
                  <ProcessingAnimation state="initial" theme={activeTheme} />
                </Card>
                <Card title="Processing State">
                  <ProcessingAnimation state="processing" theme={activeTheme} />
                </Card>
                <Card title="Complete State">
                  <ProcessingAnimation state="complete" theme={activeTheme} />
                </Card>
                <Card title="Error State">
                  <ProcessingAnimation state="error" theme={activeTheme} />
                </Card>
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="micro" className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Micro Interactions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card title="Hover Interactions">
                  <div className="space-y-4">
                    <MicroInteraction
                      variant="hover"
                      hoverPreset="hoverScale"
                      className="p-4 bg-primary/10 rounded-md text-center"
                    >
                      Hover Scale
                    </MicroInteraction>
                    
                    <MicroInteraction
                      variant="hover"
                      hoverPreset="hoverLift"
                      className="p-4 bg-primary/10 rounded-md text-center"
                    >
                      Hover Lift
                    </MicroInteraction>
                    
                    <MicroInteraction
                      variant="hover"
                      hoverPreset="hoverGlow"
                      className="p-4 bg-primary/10 rounded-md text-center"
                    >
                      Hover Glow
                    </MicroInteraction>
                  </div>
                </Card>
                
                <Card title="Continuous Animations">
                  <div className="space-y-4">
                    <MicroInteraction
                      variant="continuous"
                      continuousPreset="petWiggle"
                      className="p-4 bg-primary/10 rounded-md text-center"
                    >
                      Pet Wiggle
                    </MicroInteraction>
                    
                    <MicroInteraction
                      variant="continuous"
                      continuousPreset="petBounce"
                      className="p-4 bg-primary/10 rounded-md text-center"
                    >
                      Pet Bounce
                    </MicroInteraction>
                    
                    <MicroInteraction
                      variant="continuous"
                      continuousPreset="petTailWag"
                      className="p-4 bg-primary/10 rounded-md text-center"
                    >
                      Pet Tail Wag
                    </MicroInteraction>
                  </div>
                </Card>
                
                <Card title="Custom Animation">
                  <Animated
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="p-4 bg-primary/10 rounded-md text-center"
                  >
                    Custom Animation
                  </Animated>
                </Card>
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="transitions" className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Transition Demo</h2>
              
              <TransitionDemo />
            </section>
          </TabsContent>
          
          <TabsContent value="presets" className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Animation Presets</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <Card title="Animation Presets">
                  <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
                    {JSON.stringify(AnimationSystem.presets, null, 2)}
                  </pre>
                </Card>
                
                <Card title="Spring Presets">
                  <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
                    {JSON.stringify(AnimationSystem.springs, null, 2)}
                  </pre>
                </Card>
                
                <Card title="Transition Presets">
                  <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
                    {JSON.stringify(AnimationSystem.transitions, null, 2)}
                  </pre>
                </Card>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </PageAnimation>
    </div>
  );
}

// Simple card component for the demo
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">{title}</h3>
      <div className="flex items-center justify-center py-3">
        {children}
      </div>
    </div>
  );
}

// Transition demo component
function TransitionDemo() {
  const [show, setShow] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('fade');
  
  const presetOptions = Object.keys(AnimationSystem.transitions);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Transition Controls">
        <div className="w-full flex flex-col gap-4">
          <Button 
            onClick={() => setShow(!show)} 
            className="w-full"
          >
            {show ? 'Hide' : 'Show'} Content
          </Button>
          
          <div className="w-full grid grid-cols-2 gap-2">
            {presetOptions.map(preset => (
              <Button
                key={preset}
                variant={selectedPreset === preset ? 'default' : 'outline'}
                onClick={() => setSelectedPreset(preset)}
                className="text-xs"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </Card>
      
      <Card title="Transition Preview">
        <div className="w-full h-32 flex items-center justify-center relative">
          <AnimationSystem.Transition
            show={show}
            preset={selectedPreset as any}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="p-4 bg-primary/10 rounded-md w-32 h-32 flex items-center justify-center">
              Transition Content
            </div>
          </AnimationSystem.Transition>
        </div>
      </Card>
    </div>
  );
} 