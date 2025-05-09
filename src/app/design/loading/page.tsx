import React from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'CanvaPet Loading Components',
  description: 'Showcase of loading state components used throughout the application',
};

export default function LoadingComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Loading Components</h1>
        <p className="text-muted-foreground mb-8">
          Showcase of loading state components used throughout the application to provide feedback during asynchronous operations.
        </p>

        {/* Spinners */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Spinners</h2>
          <p className="text-muted-foreground mb-4">
            Spinners indicate that an action is in progress. They come in different sizes and colors.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Spinner Sizes</CardTitle>
              <CardDescription>
                Available in xs, sm, md, lg, and xl sizes.
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Spinner Variants</CardTitle>
              <CardDescription>
                Available in different color variants to match your UI.
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
        </section>

        {/* Loading States */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Loading States</h2>
          <p className="text-muted-foreground mb-4">
            Loading states wrap content and provide feedback during loading operations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </section>

        {/* Buttons */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Loading Buttons</h2>
          <p className="text-muted-foreground mb-4">
            Buttons that show a loading state to indicate an action in progress.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Loading Button States</CardTitle>
              <CardDescription>
                Buttons can show different loading states.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <LoadingButton isLoading={false}>
                Click Me
              </LoadingButton>
              
              <LoadingButton isLoading={true}>
                Click Me
              </LoadingButton>
              
              <LoadingButton isLoading={true} loadingText="Saving...">
                Save
              </LoadingButton>
              
              <LoadingButton isLoading={false} disabled>
                Disabled
              </LoadingButton>
            </CardContent>
          </Card>
        </section>

        {/* Skeletons */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Skeleton Loaders</h2>
          <p className="text-muted-foreground mb-4">
            Skeleton screens provide a preview of the content structure during loading.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Skeleton Table</CardTitle>
              <CardDescription>
                A skeleton loader for table data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SkeletonTable rows={3} />
            </CardContent>
          </Card>
        </section>

        {/* Progress */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Progress Indicators</h2>
          <p className="text-muted-foreground mb-4">
            Progress bars indicate completion percentage for operations like file uploads.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Progress Bars</CardTitle>
              <CardDescription>
                Show the progress of operations to users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <LoadingProgress progress={25} label="Small Progress" size="sm" showPercentage />
              <LoadingProgress progress={50} label="Medium Progress" showPercentage />
              <LoadingProgress progress={75} label="Large Progress" size="lg" showPercentage />
              <LoadingProgress progress={100} label="Complete" size="lg" showPercentage />
            </CardContent>
          </Card>
        </section>

        {/* Refresh */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Refresh Indicators</h2>
          <p className="text-muted-foreground mb-4">
            Indicators that show when content is being refreshed, particularly for pull-to-refresh.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Refresh States</CardTitle>
              <CardDescription>
                Pull-to-refresh indicators for mobile experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 divide-y">
              <div className="pb-4">
                <h3 className="font-medium mb-2">Not Refreshing (0%)</h3>
                <RefreshIndicator isRefreshing={false} progress={0} />
              </div>
              
              <div className="py-4">
                <h3 className="font-medium mb-2">Pulling (30%)</h3>
                <RefreshIndicator isRefreshing={false} progress={30} />
              </div>
              
              <div className="py-4">
                <h3 className="font-medium mb-2">Almost Ready (75%)</h3>
                <RefreshIndicator isRefreshing={false} progress={75} />
              </div>
              
              <div className="py-4">
                <h3 className="font-medium mb-2">Ready to Refresh (90%)</h3>
                <RefreshIndicator isRefreshing={false} progress={90} />
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-2">Refreshing</h3>
                <RefreshIndicator isRefreshing={true} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Error States */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Loading Errors</h2>
          <p className="text-muted-foreground mb-4">
            Error states for when loading operations fail, with retry functionality.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Error Messages</CardTitle>
              <CardDescription>
                Show error information with retry options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoadingError 
                message="Could not load data. Please check your internet connection." 
                onRetry={() => alert('Retrying...')} 
              />
              
              <LoadingError 
                message="Server error occurred. Our team has been notified." 
              />
              
              <div className="p-4 border rounded-lg mt-6">
                <h3 className="font-medium mb-2">With Loading State</h3>
                <LoadingState 
                  isLoading={false} 
                  fallback={
                    <LoadingError 
                      message="Failed to load content. Please try again." 
                      onRetry={() => alert('Retrying...')} 
                    />
                  }
                >
                  <div className="h-20 flex items-center justify-center">
                    <p>Content loaded successfully!</p>
                  </div>
                </LoadingState>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Usage Guidelines</h2>
          <Card className="p-6">
            <ol className="list-decimal ml-6 space-y-4">
              <li>
                <strong>Use Spinners</strong> for short operations (under 2 seconds) or when the exact duration is unknown.
              </li>
              <li>
                <strong>Use Progress Bars</strong> when the operation has a known duration or completion percentage.
              </li>
              <li>
                <strong>Use Skeleton Screens</strong> for content that takes time to load, especially for complex UI components.
              </li>
              <li>
                <strong>Use LoadingState</strong> components to wrap sections of the UI that load asynchronously.
              </li>
              <li>
                <strong>Use LoadingButton</strong> for form submissions and actions that take time to complete.
              </li>
              <li>
                <strong>Always provide feedback</strong> to users during operations that take longer than 300ms.
              </li>
              <li>
                <strong>Include retry options</strong> for operations that may fail due to network issues.
              </li>
            </ol>
          </Card>
        </section>
      </div>
    </div>
  );
} 