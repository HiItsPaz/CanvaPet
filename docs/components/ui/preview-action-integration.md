# Preview and Action Panel Integration

This document explains how to integrate the [ZoomablePreviewDisplay](/docs/components/ui/zoomable-preview-display.md) and [ActionPanel](/docs/components/ui/action-panel.md) components to create a complete image preview and action system.

## Overview

The CanvaPet application uses a two-component system for image preview and actions:

1. **ZoomablePreviewDisplay**: Handles image display with zoom capabilities, status indicators, and metadata
2. **ActionPanel**: Provides download and sharing functionality with various options

These components are designed to work together but can also be used independently. When combined, they create a comprehensive user interface for viewing, examining, and interacting with processed images.

## Basic Integration Pattern

```tsx
<div className="space-y-4">
  {/* The image preview component */}
  <ZoomablePreviewDisplay
    imageUrl="/path/to/image.jpg"
    alt="Pet portrait"
    title="Processed Image"
    description="Your pet image has been processed successfully"
    status="success"
    metadata={{
      "Original File": "fluffy.jpg",
      "Processed At": "2023-05-10 14:30",
      "Dimensions": "1200 × 800 px",
    }}
    hideControls={true} // Hide default controls to avoid duplication
  />
  
  {/* The action panel component */}
  <ActionPanel
    imageUrl="/path/to/image.jpg"
    title="Download or Share"
    description="Get your image in your preferred format"
  />
</div>
```

## Key Integration Considerations

### 1. Control Visibility

When using both components together, it's recommended to hide the default controls on the ZoomablePreviewDisplay to avoid duplication:

```tsx
<ZoomablePreviewDisplay
  // ...other props
  hideControls={true}
/>
```

### 2. Consistent Image References

Both components require an `imageUrl` prop. Ensure the same image URL is passed to both components:

```tsx
const imageUrl = "/path/to/processed-image.jpg";

<ZoomablePreviewDisplay imageUrl={imageUrl} /* ...other props */ />
<ActionPanel imageUrl={imageUrl} /* ...other props */ />
```

### 3. Custom Event Handling

You may want to track or process download and share actions:

```tsx
function handleDownload(format: ImageFormat, quality: ImageQuality) {
  // Track analytics 
  analytics.track("image_download", { format, quality });
  
  // Show feedback
  toast({
    title: "Download Started",
    description: `Downloading as ${format.toUpperCase()} with ${quality} quality`,
  });
}

function handleShare(platform: SharePlatform) {
  // Track analytics
  analytics.track("image_share", { platform });
  
  // Show feedback
  toast({
    title: "Sharing",
    description: `Sharing to ${platform}`,
  });
}

<ActionPanel
  imageUrl={imageUrl}
  onDownload={handleDownload}
  onShare={handleShare}
/>
```

### 4. Conditional Rendering

Often, you'll want to show the action panel only in certain states, such as after successful processing:

```tsx
<div className="space-y-4">
  <ZoomablePreviewDisplay
    imageUrl={imageUrl}
    status={processingStatus}
    statusMessage={errorMessage}
    onReprocess={processingStatus === "error" ? handleReprocess : undefined}
    // ...other props
  />
  
  {processingStatus === "success" && (
    <ActionPanel
      imageUrl={imageUrl}
      // ...other props
    />
  )}
</div>
```

## Complete Example: ProcessedImageResult

The `ProcessedImageResult` component in the CanvaPet application demonstrates a comprehensive integration of these components:

```tsx
// src/components/pets/ProcessedImageResult.tsx

export function ProcessedImageResult({
  result,
  isError,
  errorMessage = "Failed to process image",
  onReprocess,
  petId,
}: ProcessedImageResultProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Extract metadata from processing result
  const metadata = result
    ? {
        "Original File": result.originalFileName,
        "Processed At": new Date(result.processedAt).toLocaleString(),
        "File Size": `${(result.fileSize / 1024 / 1024).toFixed(2)} MB`,
        "Dimensions": result.width && result.height ? `${result.width} × ${result.height} px` : "Unknown",
        ...(result.processingTime ? { "Processing Time": `${result.processingTime.toFixed(2)}s` } : {}),
        ...(result.enhancementLevel ? { "Enhancement Level": result.enhancementLevel } : {}),
        ...(result.aiModel ? { "AI Model": result.aiModel } : {})
      }
    : {};
  
  // Determine status based on result and error state
  const status: ProcessingStatus = 
    isError ? "error" :
    result?.status === "success" ? "success" :
    result?.status === "warning" ? "warning" : 
    null;
  
  // Handle download with format and quality options
  const handleDownload = async (format: ImageFormat, quality: ImageQuality) => {
    if (!result?.url) {
      toast({
        title: "Download Error",
        description: "Image URL is not available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "Preparing Download",
        description: `Processing your ${format.toUpperCase()} file with ${quality} quality`,
      });
      
      // The ActionPanel component handles the download with format conversion
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Download Failed",
        description: "There was an error preparing your download",
        variant: "destructive",
      });
    }
  };
  
  // Handle share with platform selection
  const handleShare = async (platform: SharePlatform) => {
    if (!result?.url) {
      toast({
        title: "Sharing Error",
        description: "Image URL is not available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: `Sharing to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        description: "Preparing your content for sharing",
      });
      
      // The actual sharing functionality is handled by the ActionPanel component
    } catch (error) {
      console.error("Error sharing image:", error);
      toast({
        title: "Sharing Failed",
        description: "There was an error preparing your content for sharing",
        variant: "destructive",
      });
    }
  };
  
  // Handle continue to customization
  const handleContinue = () => {
    if (!petId) return;
    
    setIsNavigating(true);
    router.push(`/pets/${petId}/customize`);
  };
  
  if (!result && !isError) {
    return null;
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <ZoomablePreviewDisplay
        imageUrl={result?.url || "/placeholder-error.jpg"}
        alt={result?.originalFileName || "Processed pet image"}
        title="Processed Image Result"
        description={
          isError
            ? "There was an issue processing your image"
            : "Your pet image has been successfully processed and is ready for customization"
        }
        status={status}
        statusMessage={isError ? errorMessage : undefined}
        onReprocess={isError ? onReprocess : undefined}
        metadata={Object.keys(metadata).length > 0 ? metadata : undefined}
        maxHeight={500}
        hideControls={!isError} // Hide default controls when showing action panel
      />
      
      {!isError && result?.url && (
        <ActionPanel
          imageUrl={result.url}
          title="Pet Portrait"
          description="Download or share your processed pet portrait"
          onDownload={handleDownload}
          onShare={handleShare}
          className="mt-6"
        />
      )}
      
      {!isError && petId && (
        <div className="mt-6 flex justify-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={isNavigating}
            className="w-full max-w-md"
          >
            {isNavigating ? "Navigating..." : "Continue to Customization"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Additional UI elements for error states */}
    </div>
  );
}
```

## User Experience Flow

When integrated, these components create a smooth user experience flow:

1. **Image Processing**: User initiates an image processing action (upload, generation, etc.)
2. **Loading State**: The system shows a loading animation (using ProcessingAnimation component)
3. **Preview Display**: Once processing completes, the ZoomablePreviewDisplay shows the result
4. **Status Feedback**: Visual indicators communicate success, warning, or error states
5. **Detail Examination**: User can zoom, rotate, and examine the processed image
6. **Action Selection**: When satisfied, user uses the ActionPanel to download or share
7. **Format Selection**: User selects format and quality options for download
8. **Download/Share**: User receives the image in the desired format or shares it
9. **Continue Flow**: User proceeds with the application flow (e.g., to customization)

## Demo Page

A comprehensive demo showcasing the integration of these components is available at:

```
/design/preview-demo/action-panel
```

The demo includes:
- Complete integration examples
- Interactive controls for all component props
- Code snippets for implementation
- Visual explanations of the user flow

## Best Practices for Integration

1. **Consistent Styling**
   - Use the same visual theme across both components
   - Maintain consistent spacing (recommended: 16-24px between components)
   - Consider card or contained presentation for the entire system

2. **Progressive Disclosure**
   - Show the preview component first, with most immediate actions
   - Place the action panel below for secondary actions
   - Consider collapsible sections for advanced options

3. **Error Handling**
   - Show appropriate error states in the preview component
   - Disable action panel options that won't work with failed processing
   - Provide clear feedback through toast notifications

4. **Responsive Behavior**
   - Test the integrated components across all device sizes
   - On smaller screens, consider stacking all elements vertically
   - Ensure both components adapt to available space

5. **Performance Optimization**
   - Avoid loading very high-resolution images unnecessarily
   - Consider lazy loading the action panel until needed
   - Implement efficient image caching strategies

## Related Components

- [ProcessingAnimation](/docs/components/ui/processing-animation.md): Shows animated loading states
- [ImagePreview](/docs/components/ui/image-preview.md): Base component for image preview with zoom
- [Button](/docs/components/ui/button.md): Used for action triggers
- [Card](/docs/components/ui/card.md): Container component for structured layout 