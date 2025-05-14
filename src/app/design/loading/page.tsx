import Link from 'next/link';
import { 
  H1, 
  H2, 
  H3,
  P,
  Lead,
  Container,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import {
  Spinner,
  LoadingState,
  RefreshIndicator,
  LoadingButton,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  LoadingError,
  LoadingProgress,
} from '@/components/ui/loading';
import { Button } from '@/components/ui';

export const metadata = {
  title: 'Loading - CanvaPet Design',
  description: 'Loading state components and patterns for the CanvaPet design system',
};

export default function LoadingPage() {
  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/design" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Design System
        </Link>

        <H1 className="mb-4">Loading States</H1>
        <Lead className="mb-12">
          Loading components and patterns ensure users understand when content is being retrieved or actions are processing.
        </Lead>

        <div className="mb-16">
          <H2 className="mb-6">Spinners</H2>
          <P className="mb-8">
            Spinners provide visual feedback during asynchronous operations, indicating that something is happening without blocking the interface.
          </P>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Spinner Sizes</CardTitle>
              <CardDescription>
                Available in xs, sm, md, lg, and xl sizes to fit different contexts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-8">
              <Spinner size="xs" label="Extra Small" />
              <Spinner size="sm" label="Small" />
              <Spinner size="md" label="Medium" />
              <Spinner size="lg" label="Large" />
              <Spinner size="xl" label="Extra Large" />
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Spinner Variants</CardTitle>
              <CardDescription>
                Available in different color variants to match your UI and maintain consistency with your brand.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-8">
              <Spinner variant="default" label="Default" />
              <Spinner variant="primary" label="Primary" />
              <Spinner variant="secondary" label="Secondary" />
              <Spinner variant="accent" label="Accent" />
              <Spinner variant="ghost" label="Ghost" />
            </CardContent>
          </Card>
          
          <div className="bg-muted p-6 rounded-lg">
            <H3 className="mb-3">Usage Guidelines</H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium mb-2">When to use spinners</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>For short loading periods (under 10 seconds)</li>
                  <li>When the operation has no measurable progress</li>
                  <li>Within buttons or icons for contextual loading</li>
                  <li>In contained UI areas like cards or panels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">When to avoid spinners</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>For long-running operations (use progress bars instead)</li>
                  <li>When loading entire page content (use skeletons instead)</li>
                  <li>When multiple components are loading simultaneously</li>
                  <li>When progress can be measured more precisely</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Loading States</H2>
          <P className="mb-8">
            Loading states wrap content and provide feedback during loading operations, with different approaches for different scenarios.
          </P>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Overlay Loading</CardTitle>
                <CardDescription>
                  Shows a loading overlay on top of the content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoadingState isLoading={true} loadingText="Loading content...">
                  <div className="p-4 h-40 rounded border border-border">
                    <p>This content is loading...</p>
                    <p>You can still see the content behind the overlay.</p>
                  </div>
                </LoadingState>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inline Loading</CardTitle>
                <CardDescription>
                  Shows a loading indicator above the content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoadingState isLoading={true} variant="inline" loadingText="Loading content...">
                  <div className="p-4 h-40 rounded border border-border">
                    <p>This content is loading...</p>
                    <p>The content is visible but dimmed to indicate loading.</p>
                  </div>
                </LoadingState>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replace Loading</CardTitle>
                <CardDescription>
                  Replaces the content with a loading indicator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoadingState isLoading={true} variant="replace" loadingText="Loading content...">
                  <div className="p-4 h-40 rounded border border-border">
                    <p>This content is completely replaced during loading.</p>
                  </div>
                </LoadingState>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Not Loading</CardTitle>
                <CardDescription>
                  Content when not in a loading state.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoadingState isLoading={false} loadingText="Loading content...">
                  <div className="p-4 h-40 rounded border border-border">
                    <p>This content has finished loading.</p>
                    <p>The loading state is not active.</p>
                  </div>
                </LoadingState>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted p-6 rounded-lg">
            <H3 className="mb-3">Loading State Selection Guide</H3>
            <P className="mb-4">
              Choose the appropriate loading state variant based on the context:
            </P>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-medium">Overlay:</span> When users should be aware that content is updating but still be able to see its structure</li>
              <li><span className="font-medium">Inline:</span> For partial updates where maintaining context is important</li>
              <li><span className="font-medium">Replace:</span> When new content will be substantially different from the current view</li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Loading Buttons</H2>
          <P className="mb-8">
            Buttons that display loading states provide immediate feedback on user interactions without blocking navigation or other actions.
          </P>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Loading Button States</CardTitle>
              <CardDescription>
                Interactive buttons that provide visual feedback during asynchronous operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Button isLoading={false}>
                Click Me
              </Button>
              
              <Button isLoading={true}>
                Click Me
              </Button>
              
              <Button isLoading={true} loadingText="Saving...">
                Save
              </Button>
              
              <Button isLoading={false} disabled>
                Disabled
              </Button>
            </CardContent>
          </Card>
          
          <div className="bg-muted p-6 rounded-lg">
            <H3 className="mb-3">Best Practices</H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Do's</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Disable the button when loading to prevent multiple submissions</li>
                  <li>Show a loading indicator inside the button</li>
                  <li>Provide text feedback for longer operations</li>
                  <li>Keep the button the same size during loading transitions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Don'ts</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Don't allow multiple clicks during loading</li>
                  <li>Don't use generic "Loading..." text for specific actions</li>
                  <li>Don't remove the button during loading</li>
                  <li>Don't change button size dramatically during loading</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Skeleton Loaders</H2>
          <P className="mb-8">
            Skeleton screens provide a preview of the content structure during loading, reducing perceived loading time and improving user experience.
          </P>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Skeletons</CardTitle>
                <CardDescription>
                  Simple skeleton loaders for text and UI elements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                
                <div className="flex items-center gap-3 mt-6">
                  <Skeleton variant="circle" width="3rem" height="3rem" />
                  <div className="space-y-2 flex-1">
                    <Skeleton height="1rem" width="60%" />
                    <Skeleton height="0.75rem" width="40%" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Card</CardTitle>
                <CardDescription>
                  A complete card skeleton that mimics content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkeletonCard />
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Skeleton Table</CardTitle>
              <CardDescription>
                A skeleton loader for table data, showing the expected structure before content loads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SkeletonTable rows={3} />
            </CardContent>
          </Card>
          
          <div className="bg-muted p-6 rounded-lg">
            <H3 className="mb-3">When to Use Skeletons</H3>
            <P className="mb-4">
              Skeleton loaders are best for:
            </P>
            <ul className="list-disc list-inside space-y-2">
              <li>Content-heavy interfaces where layout matters</li>
              <li>Predictable UI structures like tables, lists, and cards</li>
              <li>Initial page loads and major content refreshes</li>
              <li>Reducing perceived loading time for users</li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Progress Indicators</H2>
          <P className="mb-8">
            Progress bars indicate completion percentage for operations, providing users with a sense of how long they will need to wait.
          </P>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Progress Bars</CardTitle>
              <CardDescription>
                Show the progress of operations with different sizes and styles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <LoadingProgress progress={25} label="Small Progress" size="sm" showPercentage />
              <LoadingProgress progress={50} label="Medium Progress" showPercentage />
              <LoadingProgress progress={75} label="Large Progress" size="lg" showPercentage />
              
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-3">Indeterminate Progress</h3>
                <LoadingProgress progress={-1} label="Unknown Progress" />
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-muted p-6 rounded-lg">
            <H3 className="mb-3">Best Practices</H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">When to use progress bars</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>For operations where progress can be measured</li>
                  <li>Long-running processes (file uploads, downloads)</li>
                  <li>Multi-step processes with clear stages</li>
                  <li>When users need to know how much longer to wait</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tips for implementation</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Update progress frequently to show activity</li>
                  <li>Use indeterminate progress (-1) when duration is unknown</li>
                  <li>Add labels and percentages for clarity</li>
                  <li>Consider adding time estimates for longer operations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Error States</H2>
          <P className="mb-8">
            Error states provide feedback when loading operations fail, with options for users to retry or take alternative actions.
          </P>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Loading Error Components</CardTitle>
              <CardDescription>
                Display error messages when content fails to load.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LoadingError 
                message="Failed to load content"
                onRetry={() => alert('Retry clicked')}
              />
              
              <LoadingError 
                message="Could not connect to the server. Please check your connection and try again."
                onRetry={() => alert('Retry clicked')}
              />
            </CardContent>
          </Card>
          
          <div className="bg-muted p-6 rounded-lg">
            <H3 className="mb-3">Error Handling Guidelines</H3>
            <ul className="list-disc list-inside space-y-2">
              <li>Be specific about what failed and why when possible</li>
              <li>Provide clear retry options for recoverable errors</li>
              <li>Offer alternative actions when appropriate</li>
              <li>Use friendly, non-technical language for error messages</li>
              <li>Consider offline states and connectivity issues</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link href="/design/accessibility" className="text-primary hover:underline inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Accessibility
          </Link>
          <Link href="/design" className="text-primary hover:underline inline-flex items-center">
            Design System
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </Container>
  );
} 