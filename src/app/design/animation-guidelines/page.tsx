"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PageTransitionWrapper } from '@/components/ui/page-transition-wrapper';
import Link from 'next/link';
import { InfoIcon, ExternalLinkIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

/**
 * Animation Guidelines Page
 * Quick reference for animation best practices
 */
export default function AnimationGuidelinesPage() {
  return (
    <PageTransitionWrapper>
      <div className="container mx-auto py-8 space-y-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Animation Guidelines</h1>
          <p className="text-xl text-muted-foreground">
            Best practices for implementing animations in CanvaPet
          </p>
          <div className="flex items-center gap-2">
            <Link 
              href="/design/animation-documentation" 
              className="text-primary flex items-center gap-1 hover:underline"
            >
              View complete documentation <ExternalLinkIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Animation Principles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Purpose-Driven</h3>
                <p className="text-sm text-muted-foreground">
                  Every animation should serve a clear purpose: guiding attention, providing feedback,
                  or enhancing understanding of the interface.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Consistent & Cohesive</h3>
                <p className="text-sm text-muted-foreground">
                  Animations should follow a consistent style, timing, and behavior pattern throughout
                  the application. Use the provided animation components rather than custom solutions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Subtle & Unobtrusive</h3>
                <p className="text-sm text-muted-foreground">
                  Animations should enhance, not distract. Keep movements subtle and avoid animations
                  that delay the user's ability to interact.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Performance-Conscious</h3>
                <p className="text-sm text-muted-foreground">
                  Consider performance implications, particularly on lower-powered devices. Use the 
                  built-in optimization features provided by the animation system.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Accessible</h3>
                <p className="text-sm text-muted-foreground">
                  Respect user preferences for reduced motion and ensure animations don't create
                  barriers for users with motion sensitivity.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>When to Use Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">DO Use Animations For:</h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Loading and progress states</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Transitioning between views or states</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Providing feedback for user interactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Adding personality to the pet-themed interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Drawing attention to important elements</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">DON'T Use Animations For:</h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <XCircleIcon className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Essential UI elements that users need immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircleIcon className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Form fields during active user input</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircleIcon className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Creating purely decorative effects with no purpose</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircleIcon className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Large background elements that may cause performance issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircleIcon className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Critical information that shouldn't be delayed</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference Guide</CardTitle>
              <CardDescription>
                Common animation components and their usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Loading States</h3>
                  <p className="text-sm text-muted-foreground">
                    Use LoadingAnimation for simple spinners and ProcessingAnimation for operations with progress.
                  </p>
                  <div className="bg-muted rounded-md p-3 text-xs overflow-auto">
{`// Simple loading
<LoadingAnimation 
  variant="pet" 
  size="md" 
/>

// Progress loading
<ProcessingAnimation 
  state="processing"
  progress={50}
  theme="dog"
/>`}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Transitions</h3>
                  <p className="text-sm text-muted-foreground">
                    Use PageTransitionWrapper for page transitions and Transition for component changes.
                  </p>
                  <div className="bg-muted rounded-md p-3 text-xs overflow-auto">
{`// Page transitions
<PageTransitionWrapper>
  {children}
</PageTransitionWrapper>

// Component transitions
<AnimationSystem.Transition
  show={isVisible}
  preset="fade"
>
  <div>Content</div>
</AnimationSystem.Transition>`}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Interactive Elements</h3>
                  <p className="text-sm text-muted-foreground">
                    Use MicroInteraction for hover effects and interactive elements.
                  </p>
                  <div className="bg-muted rounded-md p-3 text-xs overflow-auto">
{`// Hover effects
<MicroInteraction
  variant="hover"
  hoverPreset="hoverScale"
>
  <Button>Click Me</Button>
</MicroInteraction>

// Continuous animation
<MicroInteraction
  variant="continuous"
  continuousPreset="petWiggle"
>
  <Icon />
</MicroInteraction>`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Timing Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Entrance & Exit Animations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Entrance: 300-500ms (faster for smaller elements)</li>
                    <li>Exit: 200-300ms (generally faster than entrance)</li>
                    <li>Stagger items by 50-100ms for groups</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Hover & Interactive States</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Hover: 150-200ms</li>
                    <li>Click/tap responses: 100-150ms</li>
                    <li>Focus states: 200ms</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Loading Animations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Spinners: 1.5-2s per rotation</li>
                    <li>Progress bars: smooth transition between states</li>
                    <li>Loading to complete: 300-500ms transition</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Page Transitions</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Between pages: 300-400ms</li>
                    <li>Content fade in: staggered (100-300ms)</li>
                    <li>Navigation animations: 200-300ms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Reduced Motion</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Always respect the reduced motion preference. The animation system handles this
                    automatically, but verify when creating custom animations.
                  </p>
                  <div className="bg-muted rounded-md p-3 text-xs overflow-auto">
{`// Check manually using the hook if needed
import { useReducedMotion } from '@/hooks/use-reduced-motion';

function MyComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  // Use simpler animation if reduced motion is preferred
  const animationProps = prefersReducedMotion 
    ? { opacity: [0, 1] }
    : { opacity: [0, 1], y: [10, 0] };
    
  return (
    <motion.div
      animate={animationProps}
    >
      Content
    </motion.div>
  );
}`}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Checklist</h3>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Animations don't block crucial functionality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Loading states have appropriate ARIA labels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Animations don't auto-play without user action</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Animation durations are appropriate (not too long)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Flashing content adheres to WCAG guidelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">Alternative static content exists when needed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Need more details?</AlertTitle>
          <AlertDescription>
            Visit the <Link href="/design/animation-documentation" className="text-primary hover:underline">complete documentation</Link> for 
            in-depth examples, component API references, and implementation guides. 
            Check out the <Link href="/design/animation-demo" className="text-primary hover:underline">animation demo</Link> to see 
            all available animations.
          </AlertDescription>
        </Alert>
      </div>
    </PageTransitionWrapper>
  );
} 