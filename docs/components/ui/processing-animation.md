# Processing Animation System

This document provides an overview of the processing animation system, which includes components, hooks, and utilities for handling loading states, progress tracking, and error handling.

## Components

### ProcessingAnimation

The `ProcessingAnimation` component displays animated states for different stages of a processing operation.

```tsx
import { ProcessingAnimation } from '@/components/ui/processing-animation';

// Basic usage
<ProcessingAnimation status="processing" message="Processing your request..." />

// With progress tracking
<ProcessingAnimation 
  status="processing" 
  message="Uploading file..." 
  progress={75} 
  determinate={true} 
/>

// Different sizes
<ProcessingAnimation status="complete" message="Done!" size="sm" />
<ProcessingAnimation status="error" message="An error occurred" size="lg" />
```

#### Props

- `status`: `'initial' | 'processing' | 'complete' | 'error'` - Current state of the animation
- `message`: `string` - Message to display below the animation
- `progress`: `number` - Progress value between 0-100 for determinate operations
- `determinate`: `boolean` - Whether the operation has a specific progress value
- `progressText`: `string` - Custom text to show next to the progress percentage
- `hideProgress`: `boolean` - Hide the progress bar even when progress value is provided
- `className`: `string` - Additional CSS classes
- `onComplete`: `() => void` - Callback function when animation completes
- `loop`: `boolean` - Whether the animation should loop
- `size`: `'sm' | 'md' | 'lg'` - Size of the animation
- `renderOptions`: Object - Options for lottie-react
- `cacheKey`: `string` - Key to force re-render

### ProcessingStateProvider

The `ProcessingStateProvider` wraps the `ProcessingAnimation` component and integrates it with the `useProcessingState` hook.

```tsx
import { ProcessingStateProvider } from '@/components/ui/processing-state-provider';

// Basic usage with options
<ProcessingStateProvider
  options={{
    initialMessage: 'Ready to start',
    processingMessage: 'Processing...',
    successMessage: 'Successfully completed!',
    errorMessage: 'An error occurred',
    autoReset: true,
    resetDelay: 5000
  }}
  size="md"
/>

// With a specific operation
<ProcessingStateProvider
  options={{...}}
  operation={fetchData()}
  onStateChange={(state) => console.log('State changed:', state)}
/>

// With render props pattern
<ProcessingStateProvider
  options={{...}}
  renderContent={(state, controls) => (
    <div>
      {state.isProcessing ? (
        <button onClick={controls.cancel}>Cancel</button>
      ) : (
        <button onClick={() => controls.startProcessing(fetchData())}>
          Start
        </button>
      )}
    </div>
  )}
/>
```

#### Props

- `options`: `ProcessingOptions` - Configuration options for the processing state
- `operation`: `Promise<any>` - Async operation to execute
- `renderContent`: `(state, controls) => ReactNode` - Function to render content based on state
- `onStateChange`: `(state) => void` - Callback when state changes
- `hideAnimation`: `boolean` - Whether to hide the animation
- `customProgressText`: `(state) => string | undefined` - Function to generate custom progress text
- ...plus all `ProcessingAnimationProps` except `status`, `progress`, `determinate`, and `progressText`

## Hooks

### useProcessingState

The `useProcessingState` hook provides state management for asynchronous operations.

```tsx
import { useProcessingState } from '@/hooks/use-processing-state';

function MyComponent() {
  const [state, controls] = useProcessingState({
    initialMessage: 'Ready to start',
    timeout: 30000, // 30 seconds
    autoReset: true
  });
  
  const handleClick = async () => {
    try {
      // Start processing and pass the operation
      const result = await controls.startProcessing(fetchData());
      console.log('Result:', result);
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };
  
  return (
    <div>
      <div>Status: {state.status}</div>
      <div>Message: {state.message}</div>
      {state.determinate && <div>Progress: {state.progress}%</div>}
      
      <button onClick={handleClick} disabled={state.isProcessing}>
        {state.isProcessing ? 'Processing...' : 'Start'}
      </button>
      
      {state.isProcessing && (
        <button onClick={controls.cancel}>Cancel</button>
      )}
    </div>
  );
}
```

#### Options

- `initialStatus`: `ProcessingStatus` - Initial status
- `initialMessage`: `string` - Initial message
- `processingMessage`: `string` - Message during processing
- `successMessage`: `string` - Message on success
- `errorMessage`: `string` - Message on error
- `timeout`: `number` - Timeout in milliseconds
- `autoReset`: `boolean` - Auto-reset after completion
- `resetDelay`: `number` - Delay before auto-reset
- `startImmediately`: `boolean` - Start in processing state
- `catchErrors`: `boolean` - Catch errors internally
- `onError`: `(error: Error) => void` - Error callback
- `onSuccess`: `(result: any) => void` - Success callback
- `onStart`: `() => void` - Start callback

#### Return Value

The hook returns a tuple with:

1. `state`: Object containing the current state
   - `status`: Current status
   - `message`: Current message
   - `progress`: Progress value (0-100)
   - `error`: Error object if failed
   - `result`: Result if completed
   - `determinate`: Whether progress is determinate
   - `isProcessing`: Whether currently processing
   - `isComplete`: Whether completed (success or error)
   - `isSuccess`: Whether completed successfully
   - `isError`: Whether failed

2. `controls`: Object with methods to control the state
   - `startProcessing`: Start processing with an optional operation
   - `updateProgress`: Update progress value
   - `completeProcessing`: Mark as complete
   - `failProcessing`: Mark as failed
   - `reset`: Reset to initial state
   - `cancel`: Cancel current operation

## Utility Functions

### fetchWithProgress

```tsx
import { fetchWithProgress } from '@/lib/api/processing-utils';

const response = await fetchWithProgress('https://api.example.com/data', {
  method: 'POST',
  body: formData,
  onUploadProgress: (progress) => console.log(`Upload: ${progress}%`),
  onDownloadProgress: (progress) => console.log(`Download: ${progress}%`),
  timeout: 30000
});
```

### uploadFileWithProgress

```tsx
import { uploadFileWithProgress } from '@/lib/api/processing-utils';
import { useProcessingState } from '@/hooks/use-processing-state';

function FileUploader() {
  const [state, controls] = useProcessingState();
  
  const handleFileUpload = async (file) => {
    try {
      const response = await uploadFileWithProgress(
        '/api/upload',
        file,
        controls,
        { userId: '123' } // Additional form data
      );
      
      const result = await response.json();
      console.log('Upload result:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  // ...
}
```

### processApiRequest

```tsx
import { processApiRequest } from '@/lib/api/processing-utils';
import { useProcessingState } from '@/hooks/use-processing-state';

function DataProcessor() {
  const [state, controls] = useProcessingState();
  
  const processData = async () => {
    try {
      const result = await processApiRequest(
        '/api/process',
        controls,
        {
          method: 'POST',
          body: { data: 'example' },
          progressMessage: 'Processing data...',
          successMessage: 'Data processed successfully!'
        }
      );
      
      console.log('Process result:', result);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  };
  
  // ...
}
```

### simulateProcessing

For testing and demo purposes, you can simulate a long-running process:

```tsx
import { simulateProcessing } from '@/lib/api/processing-utils';
import { useProcessingState } from '@/hooks/use-processing-state';

function DemoProcessor() {
  const [state, controls] = useProcessingState();
  
  const runDemo = async () => {
    try {
      const result = await simulateProcessing(controls, {
        durationMs: 5000,
        progressSteps: 20,
        initialMessage: 'Starting demo...',
        progressMessage: 'Running demo',
        successMessage: 'Demo completed!',
        successProbability: 0.9 // 90% chance of success
      });
      
      console.log('Demo result:', result);
    } catch (error) {
      console.error('Demo failed:', error);
    }
  };
  
  // ...
}
```

## Integration Examples

### 1. Basic API Call

```tsx
import { useProcessingState } from '@/hooks/use-processing-state';
import { ProcessingAnimation } from '@/components/ui/processing-animation';

function ApiExample() {
  const [state, controls] = useProcessingState();
  
  const fetchData = async () => {
    try {
      controls.startProcessing();
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      controls.completeProcessing(data, 'Data fetched successfully!');
    } catch (error) {
      controls.failProcessing(error, 'Failed to fetch data');
    }
  };
  
  return (
    <div>
      <ProcessingAnimation 
        status={state.status}
        message={state.message}
        size="md"
      />
      
      <button onClick={fetchData} disabled={state.isProcessing}>
        {state.isProcessing ? 'Loading...' : 'Fetch Data'}
      </button>
    </div>
  );
}
```

### 2. File Upload with Progress

```tsx
import { useState } from 'react';
import { uploadFileWithProgress } from '@/lib/api/processing-utils';
import { useProcessingState } from '@/hooks/use-processing-state';
import { ProcessingAnimation } from '@/components/ui/processing-animation';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [state, controls] = useProcessingState();
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      const response = await uploadFileWithProgress(
        '/api/upload',
        file,
        controls
      );
      
      const result = await response.json();
      console.log('Upload result:', result);
    } catch (error) {
      // Error already handled by uploadFileWithProgress
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <div>
      <ProcessingAnimation 
        status={state.status}
        message={state.message}
        progress={state.progress}
        determinate={state.determinate}
        size="md"
      />
      
      <input type="file" onChange={handleFileChange} />
      
      <button 
        onClick={handleUpload} 
        disabled={!file || state.isProcessing}
      >
        Upload
      </button>
    </div>
  );
}
```

### 3. Higher-Order Component Pattern

```tsx
import { withProcessingState } from '@/components/ui/processing-state-provider';
import { ProcessingAnimation } from '@/components/ui/processing-animation';

function MyComponent({ processingState, processingControls, ...props }) {
  const handleProcess = async () => {
    try {
      // Start processing with the fetch operation
      await processingControls.startProcessing(fetch('/api/data'));
    } catch (error) {
      console.error('Process failed:', error);
    }
  };
  
  return (
    <div>
      <ProcessingAnimation 
        status={processingState.status}
        message={processingState.message}
        progress={processingState.progress}
        determinate={processingState.determinate}
      />
      
      <button 
        onClick={handleProcess}
        disabled={processingState.isProcessing}
      >
        Start Process
      </button>
    </div>
  );
}

// Wrap the component with processing state
export default withProcessingState(MyComponent, {
  initialMessage: 'Ready to start',
  processingMessage: 'Processing...',
  successMessage: 'Success!',
  errorMessage: 'Error occurred',
  autoReset: true,
  resetDelay: 3000
});
```

## Best Practices

1. **Error Handling**
   - Always provide clear error messages
   - Use try/catch blocks around async operations
   - Consider setting `catchErrors: true` in options to handle errors internally

2. **Progress Updates**
   - For long-running operations, provide regular progress updates
   - Use determinate progress when you can calculate a percentage
   - Use indeterminate progress when duration is unknown

3. **Timeouts**
   - Set appropriate timeouts based on the expected duration
   - Provide retry functionality for operations that time out

4. **Cleanup**
   - Always clean up resources when a component unmounts
   - Cancel in-progress operations when appropriate

5. **Accessibility**
   - Ensure animations respect user preferences (reduced motion)
   - Provide clear text descriptions of process status
   - Use ARIA attributes for screen readers

6. **Performance**
   - Use the cache mechanism to prevent unnecessary animation reloads
   - Memoize components to reduce re-renders
   - Only update progress when meaningful changes occur 