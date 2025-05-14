# Zoomable Preview Display Component

This document provides comprehensive information about the ZoomablePreviewDisplay component, which enhances the image preview experience with zoom functionality, status indicators, metadata display, and action buttons.

## Overview

The ZoomablePreviewDisplay component is a powerful image viewer designed for examining processed images in detail. It extends the functionality of the base ImagePreview component by adding status indicators, metadata display, and action buttons for common operations like downloading, sharing, and reprocessing.

## Installation

The ZoomablePreviewDisplay component is part of the CanvaPet UI component library and can be imported directly:

```tsx
import { ZoomablePreviewDisplay, ProcessingStatus } from '@/components/ui/zoomable-preview-display';
```

## Basic Usage

```tsx
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Pet portrait"
  title="Processed Image"
  description="Your pet image has been successfully processed"
/>
```

## Component Features

- **Image Zoom**: Pinch-to-zoom on touch devices, scroll/click zoom on desktop
- **Image Rotation**: Rotate image 90 degrees at a time
- **Fullscreen View**: Expand image to fullscreen mode
- **Status Indicators**: Visual indicators for success, warning, or error states
- **Metadata Display**: Show relevant image metadata in an organized panel
- **Action Buttons**: Quick access to download, share, and reprocess functions
- **Responsive Design**: Adapts to all device sizes with appropriate layouts
- **Accessibility Support**: Fully keyboard navigable with proper ARIA attributes
- **Touch Support**: Optimized for both touch and mouse interactions

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `imageUrl` | `string` | Yes | - | URL of the image to display |
| `alt` | `string` | Yes | - | Alt text for the image (accessibility) |
| `title` | `string` | No | - | Title to display above the image |
| `description` | `string` | No | - | Description text to display below the title |
| `status` | `ProcessingStatus` | No | `null` | Current processing status (success, warning, error, or null) |
| `statusMessage` | `string` | No | - | Message to display with the status indicator |
| `metadata` | `Record<string, string>` | No | `{}` | Key-value pairs of metadata to display |
| `onDownload` | `() => void` | No | - | Callback when download button is clicked |
| `onShare` | `() => void` | No | - | Callback when share button is clicked |
| `onReprocess` | `() => void` | No | - | Callback when reprocess button is clicked |
| `className` | `string` | No | - | Additional CSS class names |
| `maxHeight` | `number` | No | `undefined` | Maximum height of the preview container in pixels |
| `maxWidth` | `number` | No | `undefined` | Maximum width of the preview container in pixels |
| `hideControls` | `boolean` | No | `false` | Hide action buttons (useful when using with ActionPanel) |
| `initialZoom` | `number` | No | `1` | Initial zoom level |
| `maxZoom` | `number` | No | `5` | Maximum allowed zoom level |
| `hideMetadata` | `boolean` | No | `false` | Hide metadata section even if metadata is provided |

## Type Definitions

```tsx
// Available processing status types
export type ProcessingStatus = 'success' | 'warning' | 'error' | null;
```

## Examples

### Basic Preview with Status

```tsx
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Pet portrait"
  title="Processing Complete"
  description="Your pet image has been processed successfully"
  status="success"
/>
```

### With Warning Status and Message

```tsx
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Pet portrait"
  title="Processing Complete"
  description="Your pet image has been processed, but with some issues"
  status="warning"
  statusMessage="Some details may be missing due to low resolution"
/>
```

### With Error State

```tsx
<ZoomablePreviewDisplay
  imageUrl="/path/to/error-image.jpg"
  alt="Failed processing"
  title="Processing Failed"
  description="There was an issue processing your image"
  status="error"
  statusMessage="The image resolution was too low for processing"
  onReprocess={() => handleReprocessImage()}
/>
```

### With Metadata Display

```tsx
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Pet portrait"
  title="Processed Image"
  description="Your pet image has been processed successfully"
  status="success"
  metadata={{
    "Original File": "fluffy.jpg",
    "Processed At": "2023-05-10 14:30",
    "File Size": "2.3 MB",
    "Dimensions": "1200 × 800 px",
    "Processing Time": "3.2s",
    "Enhancement Level": "High",
    "AI Model": "PetPortraitV2"
  }}
/>
```

### With Action Buttons

```tsx
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Pet portrait"
  title="Processed Image"
  description="Your pet image has been processed successfully"
  status="success"
  onDownload={() => handleDownload()}
  onShare={() => handleShare()}
/>
```

### With Size Constraints

```tsx
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Pet portrait"
  title="Processed Image"
  description="Your pet image has been processed successfully"
  maxHeight={500}
  maxWidth={800}
/>
```

### With ActionPanel Integration

```tsx
<div className="space-y-4">
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
  
  <ActionPanel
    imageUrl="/path/to/image.jpg"
    title="Download or Share"
    description="Get your image in your preferred format"
  />
</div>
```

## Image Zoom Functionality

The ZoomablePreviewDisplay component provides rich zoom interaction capabilities:

### Desktop Interactions
- **Mouse Wheel**: Zoom in/out centered on cursor position
- **Double Click**: Zoom in at clicked position
- **Drag**: Pan the zoomed image
- **Escape Key**: Reset zoom and position
- **Rotation Button**: Rotate 90 degrees clockwise
- **Fullscreen Button**: Toggle fullscreen view

### Touch Device Interactions
- **Pinch Gesture**: Zoom in/out
- **Double Tap**: Zoom in at tapped position
- **Drag**: Pan the zoomed image
- **Rotation Button**: Rotate 90 degrees clockwise
- **Fullscreen Button**: Toggle fullscreen view

### Keyboard Navigation
- **+/-**: Zoom in/out
- **Arrow Keys**: Pan the zoomed image
- **R**: Rotate 90 degrees clockwise
- **F**: Toggle fullscreen view
- **Escape**: Reset zoom or exit fullscreen

## Status Indicators

The component includes three status states that provide visual feedback on the processing outcome:

1. **Success** (`status="success"`): 
   - Green checkmark icon
   - Indicates successful processing
   - Optional success message

2. **Warning** (`status="warning"`):
   - Yellow warning icon
   - Indicates successful processing with potential issues
   - Requires a statusMessage explaining the warning

3. **Error** (`status="error"`):
   - Red error icon
   - Indicates failed processing
   - Requires a statusMessage explaining the error
   - Shows reprocess button if onReprocess callback is provided

## Metadata Display

The metadata section displays key information about the processed image:

- Shown in a neat two-column layout
- Supports any number of key-value pairs
- Keys are displayed in the left column
- Values are displayed in the right column
- Automatically hidden if no metadata is provided
- Can be manually hidden with hideMetadata prop

## Best Practices

1. **Image Quality & Performance**
   - Provide optimized images to ensure smooth zooming performance
   - Consider pre-loading large images before display
   - Set appropriate maxHeight/maxWidth to prevent layout shifts

2. **Status Messaging**
   - Always provide clear statusMessage for warning and error states
   - Use status indicators to clearly communicate processing outcomes
   - Consider adding onReprocess callback for error states to improve UX

3. **Metadata Guidelines**
   - Keep metadata labels concise (recommended 25 characters max)
   - Use consistent formatting for similar types of information
   - Present the most important metadata first
   - Limit to 6-8 key items for optimal viewing experience

4. **Accessibility Considerations**
   - Always provide descriptive alt text for images
   - Ensure sufficient color contrast for text and status indicators
   - Test keyboard navigation for zoom and pan functionality
   - Support screen readers by using semantic HTML and ARIA attributes

5. **Mobile Optimization**
   - Test pinch-to-zoom behavior on various touch devices
   - Ensure buttons are large enough for touch interaction (min 44×44px)
   - Consider portrait and landscape orientations
   - Test on small screens to ensure all controls remain accessible

## Integration with ProcessedImageResult

For a complete implementation showing how the ZoomablePreviewDisplay component integrates with the ProcessedImageResult component, refer to:

```tsx
// src/components/pets/ProcessedImageResult.tsx

export function ProcessedImageResult({
  result,
  isError,
  errorMessage = "Failed to process image",
  onReprocess,
  petId,
}: ProcessedImageResultProps) {
  // ... component logic

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
      
      {/* Additional UI elements */}
    </div>
  );
}
```

## Demo Page

A comprehensive demo page showcasing all ZoomablePreviewDisplay features is available at:

```
/design/preview-demo/zoomable
```

The demo page includes:
- Interactive controls for all available props
- Status indicator examples
- Metadata display examples
- Zoom and rotation functionality
- Integration examples with ActionPanel
- Code snippets for implementation

## Related Components

- [ActionPanel](/docs/components/ui/action-panel.md): Provides download and share options
- [ProcessedImageResult](/docs/components/pets/processed-image-result.md): Shows processed pet images with ZoomablePreviewDisplay
- [ImagePreview](/docs/components/ui/image-preview.md): Base component for image preview with zoom 