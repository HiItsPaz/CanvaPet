"use client";

import React from 'react';
import { AnimationSystem, LoadingAnimation, ProcessingAnimation } from '@/components/ui';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, BatteryIcon, ZapIcon, EyeIcon, CodeIcon } from 'lucide-react';
import { PageTransitionWrapper } from '@/components/ui/page-transition-wrapper';

/**
 * Animation System Documentation Page
 * Comprehensive documentation of the animation system used in CanvaPet
 */
export default function AnimationDocumentationPage() {
  return (
    <PageTransitionWrapper>
      <div className="container mx-auto py-8 space-y-10">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Animation System Documentation</h1>
          <p className="text-xl text-muted-foreground">
            A comprehensive guide to using the animation system in CanvaPet.
          </p>
        </section>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 grid w-full md:w-auto grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4">Animation System Overview</h2>
              <p className="mb-4">
                The CanvaPet animation system provides a consistent, accessible, and performance-optimized 
                way to add animations throughout the application. It builds on Framer Motion with pet-themed 
                animations while ensuring accessibility and device compatibility.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Core Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="list-disc list-inside">
                      <li>Pet-themed loading animations</li>
                      <li>Page transitions</li>
                      <li>Microinteractions (hover, click)</li>
                      <li>Processing state animations</li>
                      <li>Automatic accessibility support</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Main Components</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="list-disc list-inside">
                      <li>LoadingAnimation</li>
                      <li>ProcessingAnimation</li>
                      <li>PageTransitionWrapper</li>
                      <li>MicroInteraction</li>
                      <li>AnimationSystem</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Design Principles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="list-disc list-inside">
                      <li>Accessibility first</li>
                      <li>Performance optimization</li>
                      <li>Consistent theming</li>
                      <li>Pet-themed variations</li>
                      <li>Responsive behavior</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Alert className="mt-8">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Getting Started</AlertTitle>
                <AlertDescription>
                  Import animation components from <code>@/components/ui</code> or use the 
                  <code>AnimationSystem</code> object for a single import with all components and utilities.
                </AlertDescription>
              </Alert>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">Animation Architecture</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Component Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">The animation system is built around several key components:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Animated</strong>: Base component for all animations</li>
                      <li><strong>MicroInteraction</strong>: Handles hover and continuous animations</li>
                      <li><strong>PageAnimation</strong>: Manages page transitions</li>
                      <li><strong>LoadingAnimation</strong>: Simple loading indicators</li>
                      <li><strong>ProcessingAnimation</strong>: Complex loading with progress</li>
                      <li><strong>Transition</strong>: Animation between component states</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Animation Hooks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">Core hooks that power the animation system:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>useReducedMotion</strong>: Detects user preferences</li>
                      <li><strong>useAnimationPerformance</strong>: Optimizes based on device</li>
                      <li><strong>useProcessingState</strong>: Manages loading state</li>
                      <li><strong>useTransition</strong>: Context for transitions</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="components" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4">Core Animation Components</h2>
              <p className="mb-6">
                The animation system provides several specialized components for different use cases.
                Each component is optimized for accessibility and performance.
              </p>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>LoadingAnimation</CardTitle>
                    <CardDescription>Simple loading indicators for general use</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <LoadingAnimation variant="spinner" size="md" />
                        <span className="text-sm">spinner</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <LoadingAnimation variant="pulse" size="md" />
                        <span className="text-sm">pulse</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <LoadingAnimation variant="dots" size="md" />
                        <span className="text-sm">dots</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <LoadingAnimation variant="pet" size="md" />
                        <span className="text-sm">pet</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <LoadingAnimation variant="dog" size="md" />
                        <span className="text-sm">dog</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <LoadingAnimation variant="cat" size="md" />
                        <span className="text-sm">cat</span>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`// Basic loading animation
<LoadingAnimation variant="spinner" />

// Pet-themed loading animation
<LoadingAnimation variant="pet" size="md" />

// Available variants: "spinner", "pulse", "dots", "pet", "dog", "cat", "rabbit"
// Available sizes: "sm", "md", "lg"`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ProcessingAnimation</CardTitle>
                    <CardDescription>Advanced loading with state and progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <ProcessingAnimation state="initial" theme="pet" size="md" />
                        <span className="text-sm">initial</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <ProcessingAnimation state="processing" theme="pet" size="md" progress={30} />
                        <span className="text-sm">processing</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <ProcessingAnimation state="complete" theme="pet" size="md" />
                        <span className="text-sm">complete</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <ProcessingAnimation state="error" theme="pet" size="md" />
                        <span className="text-sm">error</span>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`// Basic processing animation
<ProcessingAnimation 
  state="processing" 
  progress={50}
  theme="pet"
  size="md"
/>

// Using with processing state hook
const [state, controls] = useProcessingState();

<ProcessingAnimation 
  state={state.status}
  progress={state.progress}
  theme="dog"
/>

// Available themes: "default", "pet", "dog", "cat", "rabbit"
// Available states: "initial", "processing", "complete", "error"`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>MicroInteraction</CardTitle>
                    <CardDescription>Subtle animations for interactive elements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <AnimationSystem.MicroInteraction 
                        variant="hover"
                        hoverPreset="hoverScale"
                        className="p-4 border rounded-md flex items-center justify-center"
                      >
                        Hover Scale
                      </AnimationSystem.MicroInteraction>
                      
                      <AnimationSystem.MicroInteraction 
                        variant="hover"
                        hoverPreset="hoverLift"
                        className="p-4 border rounded-md flex items-center justify-center"
                      >
                        Hover Lift
                      </AnimationSystem.MicroInteraction>
                      
                      <AnimationSystem.MicroInteraction 
                        variant="hover"
                        hoverPreset="hoverGlow"
                        className="p-4 border rounded-md flex items-center justify-center"
                      >
                        Hover Glow
                      </AnimationSystem.MicroInteraction>
                      
                      <AnimationSystem.MicroInteraction 
                        variant="continuous"
                        continuousPreset="petWiggle"
                        className="p-4 border rounded-md flex items-center justify-center"
                      >
                        Pet Wiggle
                      </AnimationSystem.MicroInteraction>
                      
                      <AnimationSystem.MicroInteraction 
                        variant="continuous"
                        continuousPreset="petBounce"
                        className="p-4 border rounded-md flex items-center justify-center"
                      >
                        Pet Bounce
                      </AnimationSystem.MicroInteraction>
                      
                      <AnimationSystem.MicroInteraction 
                        variant="continuous"
                        continuousPreset="petTailWag"
                        className="p-4 border rounded-md flex items-center justify-center"
                      >
                        Pet TailWag
                      </AnimationSystem.MicroInteraction>
                    </div>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`// Hover interactions
<MicroInteraction 
  variant="hover"
  hoverPreset="hoverScale"
  className="your-classes"
>
  Hover over me
</MicroInteraction>

// Continuous animations
<MicroInteraction 
  variant="continuous"
  continuousPreset="petWiggle"
  className="your-classes"
>
  I wiggle continuously
</MicroInteraction>

// Hover presets: "hoverScale", "hoverLift", "hoverGlow"
// Continuous presets: "petWiggle", "petBounce", "petTailWag"`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>PageTransitionWrapper</CardTitle>
                    <CardDescription>Smooth transitions between pages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      The PageTransitionWrapper component provides consistent transitions when 
                      navigating between pages. It's typically used in the root layout or individual 
                      page components.
                    </p>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`// In layout.tsx
import { PageTransitionWrapper } from '@/components/ui';

export default function Layout({ children }) {
  return (
    <main>
      <PageTransitionWrapper>
        {children}
      </PageTransitionWrapper>
    </main>
  );
}

// With pet theme
<PageTransitionWrapper petTheme="dog">
  {children}
</PageTransitionWrapper>

// Available petThemes: "pet", "dog", "cat", "rabbit"`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4">Animation Usage Patterns</h2>
              <p className="mb-6">
                Common patterns and best practices for implementing animations throughout the application.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>When to Use Animations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Loading states</strong>: Show progress during data fetching</li>
                      <li><strong>Transitions</strong>: Smooth movement between UI states</li>
                      <li><strong>Feedback</strong>: Confirm user actions with subtle animations</li>
                      <li><strong>Attention</strong>: Direct focus to important elements</li>
                      <li><strong>Personality</strong>: Add personality with pet-themed animations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>When to Avoid Animations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Critical paths</strong>: Minimize animations in high-frequency UI</li>
                      <li><strong>Performance-sensitive areas</strong>: Use simple animations for lists</li>
                      <li><strong>Multiple animations</strong>: Avoid animating many elements at once</li>
                      <li><strong>Text content</strong>: Avoid animating large text blocks</li>
                      <li><strong>Small UI elements</strong>: Don't animate tiny controls</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Loading & Processing States</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Use ProcessingAnimation for complex operations and LoadingAnimation for simpler states.
                      Combine with useProcessingState for a complete solution.
                    </p>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`// For data fetching operations
import { useProcessingState } from '@/hooks/use-processing-state';
import { ProcessingAnimation } from '@/components/ui';

function MyComponent() {
  const [state, controls] = useProcessingState();
  
  async function fetchData() {
    controls.startProcessing();
    try {
      // Fetch data here
      // Update progress with: controls.updateProgress(30)
      const data = await api.getData();
      controls.completeProcessing(data);
    } catch (error) {
      controls.failProcessing(error);
    }
  }
  
  return (
    <div>
      <ProcessingAnimation 
        state={state.status}
        progress={state.progress}
        theme="pet"
      />
      {state.isComplete && <div>Data loaded!</div>}
      {state.isError && <div>Error: {state.error.message}</div>}
    </div>
  );
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Elements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Use MicroInteraction for buttons, cards, and interactive elements to provide 
                      feedback and enhance usability.
                    </p>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`// Animated buttons
import { Button } from '@/components/ui/button';
import { MicroInteraction } from '@/components/ui';

function MyComponent() {
  return (
    <MicroInteraction
      variant="hover"
      hoverPreset="hoverScale"
    >
      <Button>Click Me</Button>
    </MicroInteraction>
  );
}

// Animated cards
function CardGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(item => (
        <MicroInteraction
          key={item.id}
          variant="hover"
          hoverPreset="hoverLift"
          className="h-full"
        >
          <div className="border rounded-md p-4">
            {item.content}
          </div>
        </MicroInteraction>
      ))}
    </div>
  );
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Page Transitions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Use PageTransitionWrapper in layout components to provide smooth transitions 
                      between pages as users navigate.
                    </p>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`// In layout.tsx
import { PageTransitionWrapper } from '@/components/ui';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
      </main>
      <Footer />
    </>
  );
}

// Context-aware theme in page component
import { usePathname } from 'next/navigation';

function MyPage() {
  const pathname = usePathname();
  
  // Choose theme based on page path
  const getTheme = () => {
    if (pathname.includes('/pets')) return 'dog';
    if (pathname.includes('/gallery')) return 'cat';
    return 'pet';
  }
  
  return (
    <PageTransitionWrapper petTheme={getTheme()}>
      <div>Page content</div>
    </PageTransitionWrapper>
  );
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4">Performance Optimization</h2>
              <p className="mb-6">
                The animation system automatically optimizes performance based on device capabilities,
                battery status, and user preferences.
              </p>

              <Alert className="mb-6">
                <BatteryIcon className="h-4 w-4" />
                <AlertTitle>Automatic Optimization</AlertTitle>
                <AlertDescription>
                  All animation components automatically adjust based on device capabilities, battery status,
                  and reduced motion preferences without requiring explicit configuration.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <ZapIcon className="h-5 w-5" />
                      Optimization Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">None:</span>
                        <span className="text-sm">Full animations with maximum visual fidelity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">Minimal:</span>
                        <span className="text-sm">Slightly simplified animations (~30% performance improvement)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">Reduced:</span>
                        <span className="text-sm">Significantly reduced animations (~60% improvement)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">Disabled:</span>
                        <span className="text-sm">Only critical feedback animations (~90% improvement)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <EyeIcon className="h-5 w-5" />
                      Accessibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">All animations automatically respect:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>reduced motion preferences (prefers-reduced-motion)</li>
                      <li>keyboard focus management</li>
                      <li>screen reader announcements for state changes</li>
                      <li>appropriate ARIA attributes</li>
                      <li>user-controlled animation settings</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Using the Performance Hook</CardTitle>
                  <CardDescription>
                    For advanced use cases, the useAnimationPerformance hook provides detailed control.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      The useAnimationPerformance hook allows you to access and control the animation
                      optimization level directly. This is useful for custom animation components or
                      performance-critical sections.
                    </p>

                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                      <pre className="text-xs">
{`import { useAnimationPerformance } from '@/hooks/use-animation-performance';

function MyComponent() {
  const {
    // Current state
    optimizationLevel,  // 'none', 'minimal', 'reduced', or 'disabled'
    isOnBattery,       // whether device is on battery power
    currentFps,        // current frames-per-second (if available)
    prefersReducedMotion, // user preference
    isLowPowerDevice,  // device capability detection
    
    // Control functions
    setPerformanceLevel, // manually set optimization level
    resetPerformanceLevel, // reset to automatic detection
    
    // Helper flags
    shouldUseComplexAnimations, // true if full animations are ok
    shouldUseSimpleAnimations,  // true if basic animations are ok
  } = useAnimationPerformance({
    minFps: 30,               // threshold for reducing animations
    enableMonitoring: true,   // whether to check performance
    monitoringInterval: 5000, // milliseconds between checks
    optimizeOnBattery: true   // reduce when on battery
  });
  
  // Example conditional rendering based on performance
  return (
    <div>
      {shouldUseComplexAnimations ? (
        <ComplexAnimation />
      ) : (
        <SimpleAnimation />
      )}
      
      {/* Manual control example */}
      <button onClick={() => setPerformanceLevel('minimal')}>
        Reduce Animations
      </button>
    </div>
  );
}`}
                      </pre>
                    </div>

                    <Alert variant="destructive" className="mt-4">
                      <AlertTitle>Performance Best Practices</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          <li>Limit the number of simultaneous animations</li>
                          <li>Use simpler animations for lists and repeating elements</li>
                          <li>Prefer CSS transforms over other properties</li>
                          <li>Use LazyMotion when importing framer-motion directly</li>
                          <li>Test animations on low-power devices</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="examples" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4">Implementation Examples</h2>
              <p className="mb-6">
                Explore these live examples and patterns to understand how to implement animations effectively.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Example Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Visit these pages to see the animation system in action:</p>
                    <ul className="space-y-2">
                      <li>
                        <a href="/design/animation-demo" className="text-primary hover:underline flex items-center gap-1">
                          <CodeIcon className="h-4 w-4" /> Animation Demo
                        </a>
                        <p className="text-sm text-muted-foreground">Interactive demo of all animation components</p>
                      </li>
                      <li>
                        <a href="/design/animation-integration" className="text-primary hover:underline flex items-center gap-1">
                          <CodeIcon className="h-4 w-4" /> Integration Guide
                        </a>
                        <p className="text-sm text-muted-foreground">Examples of integrating animations into components</p>
                      </li>
                      <li>
                        <a href="/design/animation-performance" className="text-primary hover:underline flex items-center gap-1">
                          <CodeIcon className="h-4 w-4" /> Performance Demo
                        </a>
                        <p className="text-sm text-muted-foreground">Performance optimization in action</p>
                      </li>
                      <li>
                        <a href="/design/preview-demo" className="text-primary hover:underline flex items-center gap-1">
                          <CodeIcon className="h-4 w-4" /> Preview Demo
                        </a>
                        <p className="text-sm text-muted-foreground">Processing animation examples</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Common Implementation Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-1">Button Interactions</h3>
                        <div className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`<MicroInteraction
  variant="hover"
  hoverPreset="hoverScale"
>
  <Button>Click Me</Button>
</MicroInteraction>`}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Data Loading</h3>
                        <div className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`function DataLoader() {
  const [state, controls] = useProcessingState();
  
  useEffect(() => {
    async function loadData() {
      controls.startProcessing();
      try {
        await fetchData();
        controls.completeProcessing();
      } catch (error) {
        controls.failProcessing(error);
      }
    }
    loadData();
  }, []);
  
  return (
    <div className="relative min-h-[200px]">
      {state.isProcessing && (
        <ProcessingAnimation 
          state={state.status}
          progress={state.progress}
          theme="pet"
        />
      )}
      {state.isComplete && <DataDisplay />}
      {state.isError && <ErrorMessage error={state.error} />}
    </div>
  );
}`}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">List Item Animation</h3>
                        <div className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`function ItemList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <AnimationSystem.Animated
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.05 // staggered animation
          }}
        >
          <li className="p-4 border rounded-md">
            {item.content}
          </li>
        </AnimationSystem.Animated>
      ))}
    </ul>
  );
}`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Integration with Other Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    The animation system is designed to integrate seamlessly with other components
                    in the CanvaPet UI library.
                  </p>

                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs">
{`// Animate Dialog appearances
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AnimationSystem } from '@/components/ui';

function AnimatedDialog() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <AnimationSystem.Transition
        show={open}
        preset="scale"
      >
        <DialogContent>
          Dialog content here
        </DialogContent>
      </AnimationSystem.Transition>
    </Dialog>
  );
}

// Toast notifications with animation
import { useToast } from '@/components/ui/use-toast';
import { MicroInteraction } from '@/components/ui';

function ToastExample() {
  const { toast } = useToast();
  
  const showToast = () => {
    toast({
      title: "Action completed",
      description: "Your changes have been saved",
      action: (
        <MicroInteraction
          variant="hover"
          hoverPreset="hoverScale"
        >
          <Button variant="outline" size="sm">
            Dismiss
          </Button>
        </MicroInteraction>
      ),
    });
  };
  
  return (
    <Button onClick={showToast}>Show Toast</Button>
  );
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransitionWrapper>
  );
} 