# Action Panel Component

This document provides an overview of the Action Panel component, which offers a comprehensive interface for downloading and sharing images within the CanvaPet application.

## Overview

The Action Panel component is a flexible UI element that provides users with options to download images in various formats and quality levels, as well as share content to social media platforms. It's designed to work in conjunction with image preview components like the `ZoomablePreviewDisplay`.

## Installation

The Action Panel component is part of the CanvaPet UI component library and can be imported directly:

```tsx
import { ActionPanel } from '@/components/ui/action-panel';
```

## Basic Usage

```tsx
<ActionPanel
  imageUrl="/path/to/image.jpg"
  title="Pet Portrait"
  description="Download or share your processed pet portrait"
  onDownload={(format, quality) => console.log(`Downloading as ${format} with ${quality} quality`)}
  onShare={(platform) => console.log(`Sharing to ${platform}`)}
/>
```

## Component Features

- **Multiple Download Formats**: Supports JPG, PNG, and WebP with different quality options
- **Social Media Sharing**: Includes direct sharing to Facebook, Twitter, Instagram, and LinkedIn
- **Email & Copy Options**: Allows sharing via email or copying to clipboard
- **Web Share API Integration**: Uses native sharing on supported devices with appropriate fallbacks
- **Client-side Format Conversion**: Converts images to different formats directly in the browser
- **Responsive Design**: Adapts to all device sizes with appropriate layouts
- **Accessibility Support**: Fully keyboard navigable with proper ARIA attributes
- **Loading States**: Visual feedback during processing operations
- **Error Handling**: Graceful error management with toast notifications

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `imageUrl` | `string` | Yes | - | URL of the image to be downloaded or shared |
| `title` | `string` | No | - | Title to display in the panel header |
| `description` | `string` | No | - | Description text to display below the title |
| `onDownload` | `(format: ImageFormat, quality: ImageQuality) => void` | No | - | Callback when download is initiated |
| `onShare` | `(platform: SharePlatform) => void` | No | - | Callback when share is initiated |
| `allowedFormats` | `ImageFormat[]` | No | `['jpg', 'png', 'webp']` | Formats that should be available |
| `defaultFormat` | `ImageFormat` | No | `'jpg'` | Default selected format |
| `defaultQuality` | `ImageQuality` | No | `'high'` | Default selected quality |
| `className` | `string` | No | - | Additional CSS class names |
| `hideDownload` | `boolean` | No | `false` | Hide download options section |
| `hideShare` | `boolean` | No | `false` | Hide share options section |
| `customDownloadText` | `string` | No | `'Download'` | Custom text for download button |
| `customShareText` | `string` | No | `'Share'` | Custom text for share button |

## Type Definitions

```tsx
// Available image formats
export type ImageFormat = 'jpg' | 'png' | 'webp';

// Available image quality options
export type ImageQuality = 'low' | 'medium' | 'high';

// Available sharing platforms
export type SharePlatform = 
  | 'facebook' 
  | 'twitter' 
  | 'instagram' 
  | 'linkedin'
  | 'email'
  | 'copy';
```

## Examples

### Basic Usage with Default Options

```tsx
<ActionPanel
  imageUrl="https://example.com/my-image.jpg"
  title="Pet Portrait"
  description="Download or share your pet portrait"
/>
```

### Custom Download and Share Handlers

```tsx
<ActionPanel
  imageUrl="https://example.com/my-image.jpg"
  title="Portrait Result"
  description="Your pet portrait is ready to download or share"
  onDownload={(format, quality) => {
    // Track analytics
    analytics.track('image_download', { format, quality });
    
    // Custom download handling can go here if needed
    toast({
      title: "Download Started",
      description: `Downloading as ${format.toUpperCase()} with ${quality} quality`,
    });
  }}
  onShare={(platform) => {
    // Track analytics
    analytics.track('image_share', { platform });
    
    // Custom share handling can go here if needed
    toast({
      title: "Sharing Initiated",
      description: `Sharing to ${platform}`,
    });
  }}
/>
```

### Limited Format Options

```tsx
<ActionPanel
  imageUrl="https://example.com/my-image.jpg"
  title="Limited Options Example"
  description="Only JPG and PNG are available"
  allowedFormats={['jpg', 'png']}
  defaultFormat="png"
  defaultQuality="high"
/>
```

### Download Only or Share Only

```tsx
// Download Only
<ActionPanel
  imageUrl="https://example.com/my-image.jpg"
  title="Download Only"
  description="No sharing options available"
  hideShare={true}
/>

// Share Only
<ActionPanel
  imageUrl="https://example.com/my-image.jpg"
  title="Share Only"
  description="No download options available"
  hideDownload={true}
/>
```

### Integration with ZoomablePreviewDisplay

```tsx
<div className="space-y-4">
  <ZoomablePreviewDisplay
    imageUrl="https://example.com/my-image.jpg"
    alt="A pet portrait"
    title="Processed Image"
    description="Your pet portrait has been processed"
    hideControls={true} // Hide default controls since we're using ActionPanel
  />
  
  <ActionPanel
    imageUrl="https://example.com/my-image.jpg"
    title="Download or Share"
    description="Get your image in your preferred format"
  />
</div>
```

## Image Format Conversion Details

The ActionPanel component handles image format conversion directly in the browser using the Canvas API. Here's how it works:

1. The original image is loaded from the provided `imageUrl`
2. A canvas element is created and the image is drawn onto it
3. The canvas is used to export the image in the selected format (JPG, PNG, or WebP)
4. Quality settings are applied during the export process
5. The resulting blob is converted to a downloadable file

This approach has several advantages:
- No server-side processing required
- Works with images from any source (same-origin restrictions apply)
- Supports modern formats like WebP
- Quality control options for file size management

## Best Practices

1. **Performance Considerations**
   - Large images may take longer to process in the browser
   - Consider implementing a loading state for very large images
   - The component implements error handling for failed conversions

2. **Security and CORS**
   - Images must be accessible according to CORS policies
   - For cross-origin images, ensure proper CORS headers are set
   - Local files and same-origin images work without restrictions

3. **Accessibility**
   - All interactive elements are keyboard focusable
   - Proper ARIA attributes are used throughout
   - Use custom button text for better context when needed

4. **Mobile Considerations**
   - Uses Web Share API on supported mobile devices
   - Falls back to platform-specific options on other devices
   - Responsive design adapts to all screen sizes

5. **Error Handling**
   - Implements toast notifications for errors
   - Gracefully handles format conversion failures
   - Provides user feedback for all operations

## Demo Page

A comprehensive demo page showcasing all the ActionPanel features is available at:

```
/design/preview-demo/action-panel
```

The demo page includes:
- All format and quality combinations
- Social sharing options
- Integration with ZoomablePreviewDisplay
- Interactive controls for testing
- Code examples for implementation

## Related Components

- [ZoomablePreviewDisplay](/docs/components/ui/zoomable-preview-display.md): Display images with zoom capability
- [ProcessedImageResult](/docs/components/pets/processed-image-result.md): Show processed pet images with action options 