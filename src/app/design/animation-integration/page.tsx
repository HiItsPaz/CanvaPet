"use client";

import React, { useState } from 'react';
import { 
  AnimationSystem,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormSubmitButton,
  ContentLoader,
  AnimatedLink,
  PageTransitionWrapper,
  MicroInteraction
} from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/ui/code-block';

export default function AnimationIntegrationPage() {
  const [loadingState, setLoadingState] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleLoadingToggle = () => {
    setLoadingState(true);
    setTimeout(() => setLoadingState(false), 2000);
  };
  
  const handleFormSubmit = () => {
    setFormState('submitting');
    setTimeout(() => {
      // Randomly succeed or fail
      const success = Math.random() > 0.5;
      setFormState(success ? 'success' : 'error');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setFormState('idle');
      }, 3000);
    }, 2000);
  };
  
  return (
    <PageTransitionWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Animation Integration Guide</h1>
        <p className="text-lg mb-8">
          Learn how to integrate the CanvaPet animation system into your components.
          This guide shows practical examples of using the animation components across different scenarios.
        </p>
        
        <Tabs defaultValue="page-transitions">
          <TabsList className="mb-4">
            <TabsTrigger value="page-transitions">Page Transitions</TabsTrigger>
            <TabsTrigger value="loading-states">Loading States</TabsTrigger>
            <TabsTrigger value="form-animations">Form Animations</TabsTrigger>
            <TabsTrigger value="micro-interactions">Micro Interactions</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="page-transitions" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Page Transitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Use the <code>PageTransitionWrapper</code> component to add consistent page transitions.
                  Place it in your layout files or directly in page components.
                </p>
                
                <CodeBlock code={`
// In your layout.tsx or page.tsx file
import { PageTransitionWrapper } from '@/components/ui';

export default function MyPage() {
  return (
    <PageTransitionWrapper>
      <div className="container">
        {/* Your page content */}
      </div>
    </PageTransitionWrapper>
  );
}
                `} language="tsx" />
                
                <div className="my-4">
                  <h3 className="text-lg font-medium mb-2">Pet Theme Options</h3>
                  <p>You can customize the transition theme to match different pet types:</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <AnimatedLink href="#" className="no-underline">
                      <Card className="cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle>Default Pet Theme</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <code>petTheme="pet"</code>
                        </CardContent>
                      </Card>
                    </AnimatedLink>
                    
                    <AnimatedLink href="#" className="no-underline">
                      <Card className="cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle>Dog Theme</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <code>petTheme="dog"</code>
                        </CardContent>
                      </Card>
                    </AnimatedLink>
                    
                    <AnimatedLink href="#" className="no-underline">
                      <Card className="cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle>Cat Theme</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <code>petTheme="cat"</code>
                        </CardContent>
                      </Card>
                    </AnimatedLink>
                    
                    <AnimatedLink href="#" className="no-underline">
                      <Card className="cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle>Rabbit Theme</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <code>petTheme="rabbit"</code>
                        </CardContent>
                      </Card>
                    </AnimatedLink>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="loading-states" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Content Loading States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Use the <code>ContentLoader</code> component to wrap content that needs to show a loading state.
                </p>
                
                <CodeBlock code={`
import { ContentLoader } from '@/components/ui';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data, etc.
  
  return (
    <ContentLoader 
      isLoading={isLoading}
      loadingText="Loading pet profiles..."
      variant="pet"
      size="md"
    >
      {/* Your content */}
    </ContentLoader>
  );
}
                `} language="tsx" />
                
                <div className="my-4 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2">Live Example</h3>
                  <Button onClick={handleLoadingToggle} className="mb-4">
                    {loadingState ? 'Loading...' : 'Show Loading State'}
                  </Button>
                  
                  <ContentLoader 
                    isLoading={loadingState}
                    loadingText="Loading content..."
                    variant="pet"
                    minHeight="10rem"
                  >
                    <div className="p-4 bg-muted rounded-md">
                      <h4 className="font-semibold">Content Loaded!</h4>
                      <p>This content is now visible because loading has completed.</p>
                    </div>
                  </ContentLoader>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="form-animations" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Form Submission Animations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Use the <code>FormSubmitButton</code> component to provide visual feedback during form submissions.
                </p>
                
                <CodeBlock code={`
import { FormSubmitButton } from '@/components/ui';

function MyForm() {
  const [submitState, setSubmitState] = useState('idle');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState('submitting');
    
    try {
      // Submit form data
      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <FormSubmitButton 
        state={submitState}
        loadingText="Saving..."
        successText="Saved!"
        errorText="Failed to save"
      >
        Save Changes
      </FormSubmitButton>
    </form>
  );
}
                `} language="tsx" />
                
                <div className="my-4 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2">Live Example</h3>
                  
                  <FormSubmitButton 
                    state={formState}
                    loadingText="Submitting Form..."
                    successText="Form Submitted!"
                    errorText="Submission Failed"
                    onClick={handleFormSubmit}
                    className="w-full sm:w-auto"
                  >
                    Submit Form
                  </FormSubmitButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="micro-interactions" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Micro Interactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Use the <code>MicroInteraction</code> component to add subtle animations to UI elements.
                </p>
                
                <CodeBlock code={`
import { MicroInteraction } from '@/components/ui';

function MyComponent() {
  return (
    <div className="space-y-4">
      <MicroInteraction variant="hover" hoverPreset="hoverScale">
        <button className="px-4 py-2 bg-primary text-white rounded-md">
          Hover Me (Scale)
        </button>
      </MicroInteraction>
      
      <MicroInteraction variant="hover" hoverPreset="hoverLift">
        <button className="px-4 py-2 bg-secondary text-white rounded-md">
          Hover Me (Lift)
        </button>
      </MicroInteraction>
      
      <MicroInteraction variant="continuous" continuousPreset="bounce">
        <div className="p-4 bg-muted rounded-md">
          Continuous Animation
        </div>
      </MicroInteraction>
    </div>
  );
}
                `} language="tsx" />
                
                <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md flex justify-center">
                    <MicroInteraction variant="hover" hoverPreset="hoverScale">
                      <Button variant="default">Hover Me (Scale)</Button>
                    </MicroInteraction>
                  </div>
                  
                  <div className="p-4 border rounded-md flex justify-center">
                    <MicroInteraction variant="hover" hoverPreset="hoverLift">
                      <Button variant="secondary">Hover Me (Lift)</Button>
                    </MicroInteraction>
                  </div>
                  
                  <div className="p-4 border rounded-md flex justify-center">
                    <MicroInteraction variant="hover" hoverPreset="hoverGlow">
                      <Button variant="outline">Hover Me (Glow)</Button>
                    </MicroInteraction>
                  </div>
                  
                  <div className="p-4 border rounded-md flex justify-center">
                    <MicroInteraction variant="continuous" continuousPreset="petBounce">
                      <div className="p-4 bg-muted rounded-md">
                        Bounce Animation
                      </div>
                    </MicroInteraction>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="navigation" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Animated Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Use the <code>AnimatedLink</code> component to enhance navigation with animations.
                </p>
                
                <CodeBlock code={`
import { AnimatedLink } from '@/components/ui';

function MyNavigation() {
  return (
    <nav className="space-x-4">
      <AnimatedLink 
        href="/home" 
        hoverEffect="scale"
        showLoadingState={true}
      >
        Home
      </AnimatedLink>
      
      <AnimatedLink 
        href="/gallery" 
        hoverEffect="lift"
        showLoadingState={true}
      >
        Gallery
      </AnimatedLink>
      
      <AnimatedLink 
        href="/profile" 
        hoverEffect="glow"
        showLoadingState={true}
      >
        Profile
      </AnimatedLink>
    </nav>
  );
}
                `} language="tsx" />
                
                <div className="my-4 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2">Link Examples</h3>
                  <div className="flex flex-wrap gap-4">
                    <AnimatedLink 
                      href="#" 
                      hoverEffect="scale"
                      className="px-4 py-2 bg-primary text-white rounded-md"
                    >
                      Scale Effect
                    </AnimatedLink>
                    
                    <AnimatedLink 
                      href="#" 
                      hoverEffect="lift"
                      className="px-4 py-2 bg-secondary text-white rounded-md"
                    >
                      Lift Effect
                    </AnimatedLink>
                    
                    <AnimatedLink 
                      href="#" 
                      hoverEffect="glow"
                      className="px-4 py-2 bg-accent text-white rounded-md"
                    >
                      Glow Effect
                    </AnimatedLink>
                    
                    <AnimatedLink 
                      href="#" 
                      hoverEffect="none"
                      className="px-4 py-2 bg-muted rounded-md"
                    >
                      No Effect
                    </AnimatedLink>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransitionWrapper>
  );
} 