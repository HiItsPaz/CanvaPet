# Loading Component Usage Guide

This guide provides comprehensive documentation on when and how to use the loading components in the CanvaPet application to create a consistent, accessible, and user-friendly experience.

## Table of Contents

1. [Component Selection Guidelines](#component-selection-guidelines)
2. [Spinner](#spinner)
3. [LoadingState](#loadingstate)
4. [LoadingButton](#loadingbutton)
5. [Skeleton Loaders](#skeleton-loaders)
6. [Progress Indicators](#progress-indicators)
7. [RefreshIndicator](#refreshindicator)
8. [LoadingError](#loadingerror)
9. [Accessibility Considerations](#accessibility-considerations)
10. [Performance Tips](#performance-tips)

## Component Selection Guidelines

Choose the appropriate loading component based on the operation duration and context:

| Duration | Component Type | Use Case |
|----------|---------------|----------|
| < 1 second | None needed | Very quick operations may not need a loader |
| 1-3 seconds | Spinner or LoadingButton | Form submissions, short API calls |
| 3+ seconds without known progress | LoadingState or Skeleton | Content loading, page transitions |
| 3+ seconds with known progress | LoadingProgress | File uploads, multi-step operations |
| Mobile interactions | RefreshIndicator | Pull-to-refresh functionality |
| Failed operations | LoadingError | Network issues, server errors |

## Spinner

**When to use:**
- Short operations where you want to indicate activity
- As part of other components (buttons, inline indicators)
- When space is limited

**Example:**
```tsx
// In data fetching components
const [isLoading, setIsLoading] = useState(false);

// For quick operations
<Spinner size="sm" />

// With label and variant
<Spinner 
  size="md" 
  variant="primary" 
  label="Loading profile..." 
/>

// Inside other elements
<div className="flex items-center gap-2">
  {isLoading && <Spinner size="xs" />}
  <span>Updating preferences</span>
</div>
```

## LoadingState

**When to use:**
- When loading affects a section of the UI
- For content that takes time to fetch
- When you want to show loading context

**Variants:**
- `overlay`: Shows a translucent overlay with spinner over content (ideal for refreshing existing content)
- `inline`: Shows a spinner above the content area (good for initial loading with placeholder content)
- `replace`: Completely replaces content with a spinner (use when no placeholder makes sense)

**Example:**
```tsx
// Basic usage with overlay
<LoadingState isLoading={isLoadingData}>
  <UserProfileCard data={userData} />
</LoadingState>

// Inline variant with custom text
<LoadingState 
  isLoading={isLoadingComments} 
  variant="inline"
  loadingText="Loading comments..."
>
  <CommentsList comments={comments} />
</LoadingState>

// Replace variant for initial content load
<LoadingState 
  isLoading={!userData} 
  variant="replace"
  spinnerSize="lg"
>
  <UserDashboard data={userData} />
</LoadingState>
```

## LoadingButton

**When to use:**
- Form submissions
- User-initiated actions that take time
- When you need to prevent duplicate submissions

**Example:**
```tsx
// Basic form submission button
const [isSubmitting, setIsSubmitting] = useState(false);

<form onSubmit={async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    await submitForm(formData);
  } finally {
    setIsSubmitting(false);
  }
}}>
  {/* Form fields */}
  
  <LoadingButton 
    isLoading={isSubmitting} 
    loadingText="Saving..."
    type="submit"
  >
    Save Changes
  </LoadingButton>
</form>

// Secondary action with loading state
<LoadingButton
  isLoading={isProcessing}
  className="bg-secondary text-secondary-foreground"
  onClick={handleProcessAction}
>
  Process
</LoadingButton>
```

## Skeleton Loaders

**When to use:**
- Initial content loading for complex UI components
- When you want to show content structure before data arrives
- To reduce perceived loading time and layout shifts

**Components:**
- `Skeleton`: Basic skeleton shapes
- `SkeletonCard`: Pre-built card skeleton
- `SkeletonTable`: Pre-built table skeleton

**Example:**
```tsx
// Basic skeleton for text content
<div className="space-y-2">
  <Skeleton className="h-6 w-3/4" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-2/3" />
</div>

// User avatar and name
<div className="flex items-center gap-3">
  <Skeleton variant="circle" width="2.5rem" height="2.5rem" />
  <div>
    <Skeleton height="1rem" width="120px" />
  </div>
</div>

// For lists of items
{isLoading ? (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : (
  <ProductList products={products} />
)}

// For data tables
{isLoading ? <SkeletonTable rows={5} /> : <DataTable data={tableData} />}
```

## Progress Indicators

**When to use:**
- File uploads
- Multi-step processes
- Operations with measurable progress
- Long-running tasks

**Example:**
```tsx
// File upload
const [uploadProgress, setUploadProgress] = useState(0);

// Upload function that updates progress
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: (event) => {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(percentCompleted);
      }
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

return (
  <div className="space-y-4">
    <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
    
    {uploadProgress > 0 && (
      <LoadingProgress 
        progress={uploadProgress} 
        label="Uploading file..." 
        showPercentage 
        size="md"
      />
    )}
  </div>
);
```

## RefreshIndicator

**When to use:**
- Mobile-first pull-to-refresh interactions
- Manual refresh actions
- To provide feedback during content refreshing

**Example:**
```tsx
// In a mobile-optimized component
const [isRefreshing, setIsRefreshing] = useState(false);
const [pullProgress, setPullProgress] = useState(0);

// Hook into pull-to-refresh logic
useEffect(() => {
  // Set up pull detection and progress tracking
  const handlePull = (progress) => {
    setPullProgress(progress);
    if (progress >= 100) {
      setIsRefreshing(true);
      refreshData().finally(() => {
        setIsRefreshing(false);
        setPullProgress(0);
      });
    }
  };
  
  // Set up event listeners here
  
  return () => {
    // Clean up event listeners
  };
}, []);

return (
  <div>
    <RefreshIndicator 
      isRefreshing={isRefreshing} 
      progress={pullProgress} 
    />
    <ContentList items={items} />
  </div>
);
```

## LoadingError

**When to use:**
- When data loading or operations fail
- To provide clear error messaging
- When retry functionality is appropriate

**Example:**
```tsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed to fetch data');
    const result = await response.json();
    setData(result);
  } catch (err) {
    setError(err.message || 'An error occurred while loading data');
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);

return (
  <div>
    <h2>Data View</h2>
    
    <LoadingState isLoading={isLoading}>
      {error ? (
        <LoadingError 
          message={error} 
          onRetry={fetchData} 
        />
      ) : (
        <DataDisplay data={data} />
      )}
    </LoadingState>
  </div>
);
```

## Accessibility Considerations

- All loading components include proper ARIA attributes
- Spinners have `role="status"` and `aria-live="polite"`
- Progress bars use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`
- Provide text alternatives for visual indicators
- Ensure sufficient color contrast for all loading states

## Performance Tips

1. **Avoid Unnecessary Loading States**
   - For operations under 300ms, loading indicators may not be needed and can create UI flicker

2. **Prevent Layout Shifts**
   - Reserve space for loading components at the same dimensions as loaded content
   - Use `min-height` to ensure containers don't collapse during loading

3. **Progressive Enhancement**
   - Show simple spinners for quick operations
   - Replace with skeletons or progress bars for longer operations

4. **Debounce Loading States**
   ```tsx
   // Avoid flickering for quick operations
   const [isLoading, setIsLoading] = useState(false);
   
   const fetchWithDebounce = async () => {
     const loadingTimeout = setTimeout(() => setIsLoading(true), 300);
     
     try {
       await fetchData();
     } finally {
       clearTimeout(loadingTimeout);
       setIsLoading(false);
     }
   };
   ```

5. **Maintain Consistency**
   - Use the same loading patterns for similar operations throughout the application
   - Follow the design system's color and sizing conventions 