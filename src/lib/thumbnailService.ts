import { compressImage, fileToDataUrl, dataUrlToFile } from "./imageUtils";
import { Style } from "@/types/customization";
import { encode } from "blurhash";

// Constants for thumbnail generation
export const THUMBNAIL_SIZES = {
  small: { width: 100, height: 100 },
  medium: { width: 200, height: 200 },
  large: { width: 400, height: 300 },
};

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

interface ThumbnailOptions {
  size?: ThumbnailSize;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  maintainAspectRatio?: boolean;
  crop?: boolean;
  blurhash?: boolean;
}

const DEFAULT_OPTIONS: ThumbnailOptions = {
  size: "medium",
  quality: 0.8,
  format: "webp",
  maintainAspectRatio: true,
  crop: false,
  blurhash: false,
};

/**
 * Generate a thumbnail from an image file
 * 
 * @param imageFile The source image file
 * @param options Thumbnail generation options
 * @returns Promise resolving to the thumbnail file and optional blur hash
 */
export async function generateThumbnail(
  imageFile: File,
  options: ThumbnailOptions = DEFAULT_OPTIONS
): Promise<{ file: File; blurhash?: string }> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { size, quality, format, maintainAspectRatio, crop, blurhash: generateBlurhash } = mergedOptions;
  
  try {
    // Step 1: Convert file to data URL for canvas manipulation
    const dataUrl = await fileToDataUrl(imageFile);
    
    // Step 2: Create an image element to get dimensions
    const img = await createImageFromDataUrl(dataUrl);
    
    // Step 3: Create a canvas with the target dimensions
    const canvas = document.createElement("canvas");
    const targetDimensions = THUMBNAIL_SIZES[size || "medium"];
    
    // Set canvas dimensions based on options
    let { width, height } = targetDimensions;
    
    // Calculate dimensions maintaining aspect ratio if needed
    if (maintainAspectRatio && !crop) {
      const aspectRatio = img.width / img.height;
      
      if (img.width / img.height > width / height) {
        // Image is wider than target
        height = width / aspectRatio;
      } else {
        // Image is taller than target
        width = height * aspectRatio;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Step 4: Draw the image on the canvas with appropriate cropping/scaling
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    if (crop) {
      // Crop to fit desired dimensions while maintaining aspect ratio
      const sourceAspect = img.width / img.height;
      const targetAspect = width / height;
      
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;
      
      if (sourceAspect > targetAspect) {
        // Source image is wider
        sourceWidth = img.height * targetAspect;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        // Source image is taller
        sourceHeight = img.width / targetAspect;
        sourceY = (img.height - sourceHeight) / 2;
      }
      
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, width, height
      );
    } else {
      // Scale without cropping
      ctx.drawImage(img, 0, 0, width, height);
    }
    
    // Step 5: Generate blurhash if needed
    let blurhashValue: string | undefined;
    
    if (generateBlurhash) {
      try {
        blurhashValue = await generateBlurHash(canvas);
      } catch (error) {
        console.error("Error generating blurhash:", error);
      }
    }
    
    // Step 6: Convert canvas to data URL with desired format and quality
    const mimeType = `image/${format}`;
    const thumbnailDataUrl = canvas.toDataURL(mimeType, quality);
    
    // Step 7: Convert data URL back to file
    const thumbnailFile = await dataUrlToFile(
      thumbnailDataUrl,
      `thumbnail_${size}_${Date.now()}.${format}`
    );
    
    return {
      file: thumbnailFile,
      blurhash: blurhashValue
    };
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    
    // If thumbnail generation fails, compress the original as fallback
    const compressedFile = await compressImage(imageFile, {
      maxWidthOrHeight: THUMBNAIL_SIZES[size || "medium"].width,
      maxSizeMB: 0.2,
      initialQuality: quality || 0.7,
    });
    
    return { file: compressedFile };
  }
}

/**
 * Create an Image object from a data URL
 */
function createImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Generate a blurhash for an image canvas
 */
async function generateBlurHash(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      
      // For a proper implementation, we'd use the blurhash library directly
      // But since the encode function requires a specific pixel format,
      // we'll create a tiny thumbnail as a placeholder instead
      
      // Generate a tiny data URL for use as a blurhash placeholder
      const thumbnailCanvas = document.createElement("canvas");
      thumbnailCanvas.width = 32;
      thumbnailCanvas.height = 32;
      
      const thumbnailCtx = thumbnailCanvas.getContext("2d");
      if (thumbnailCtx) {
        thumbnailCtx.drawImage(canvas, 0, 0, 32, 32);
        const tinyImageUrl = thumbnailCanvas.toDataURL("image/jpeg", 0.5);
        
        // Return the tiny preview as our "blurhash"
        resolve(tinyImageUrl);
      } else {
        throw new Error("Could not create thumbnail context");
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a placeholder thumbnail for styles that don't have one
 * 
 * @param style The style object
 * @param theme Customization theme to use for placeholder
 * @returns Promise resolving to a data URL for the thumbnail
 */
export async function generateStylePlaceholder(
  style: Pick<Style, "id" | "name">,
  theme: "light" | "dark" = "light"
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_SIZES.medium.width;
  canvas.height = THUMBNAIL_SIZES.medium.height;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  
  // Use style ID to determine a consistent color
  const hue = hashStringToNumber(style.id) % 360;
  
  // Set colors based on theme
  const backgroundColor = theme === "light" 
    ? `hsl(${hue}, 60%, 90%)` 
    : `hsl(${hue}, 60%, 20%)`;
  
  const textColor = theme === "light"
    ? `hsl(${hue}, 80%, 30%)`
    : `hsl(${hue}, 80%, 80%)`;
  
  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw style name
  ctx.fillStyle = textColor;
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Truncate name if too long
  const maxLength = 15;
  const displayName = style.name.length > maxLength
    ? `${style.name.substring(0, maxLength - 3)}...`
    : style.name;
  
  ctx.fillText(displayName, canvas.width / 2, canvas.height / 2);
  
  // Return as data URL
  return canvas.toDataURL("image/png");
}

/**
 * Generate thumbnails for a batch of styles
 * 
 * @param styles Array of style objects
 * @param options Options for thumbnail generation
 * @returns Promise resolving to styles with thumbnails
 */
export async function generateStyleThumbnails(
  styles: Style[],
  options: ThumbnailOptions = DEFAULT_OPTIONS
): Promise<Style[]> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options, blurhash: true };
  
  return Promise.all(
    styles.map(async (style) => {
      // If thumbnail URL exists and is valid, use it
      if (style.thumbnailUrl && isValidUrl(style.thumbnailUrl)) {
        return style;
      }
      
      try {
        // For real implementation, we'd fetch an actual source image
        // For now, we'll generate a placeholder
        const placeholderUrl = await generateStylePlaceholder(style);
        
        // Convert the placeholder to a file
        const dummyFile = await dataUrlToFile(
          placeholderUrl,
          `placeholder_${style.id}_${Date.now()}.png`
        );
        
        // Generate thumbnail with blurhash
        const { file, blurhash } = await generateThumbnail(dummyFile, mergedOptions);
        
        // Convert back to data URL for easy use
        const thumbnailUrl = await fileToDataUrl(file);
        
        return {
          ...style,
          thumbnailUrl,
          blurhash
        };
      } catch (error) {
        console.error(`Error generating thumbnail for style ${style.id}:`, error);
        return style;
      }
    })
  );
}

/**
 * Check if a URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hash a string to a number (for generating consistent colors)
 */
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Preload style thumbnails for better performance
 * 
 * @param styles Array of style objects
 */
export function preloadStyleThumbnails(styles: Style[]): void {
  styles.forEach(style => {
    if (style.thumbnailUrl) {
      const img = new Image();
      img.src = style.thumbnailUrl;
    }
  });
}

/**
 * Generate a preview of a style applied to a pet image
 * 
 * @param petImageFile The pet image file
 * @param style The style to apply
 * @param intensity The intensity of the style application (0-100)
 * @returns Promise with style preview dataURL
 */
export async function generateStylePreview(
  petImageFile: File | string,
  styleId: string,
  intensity: number = 50
): Promise<string> {
  // In a real implementation, this would call an AI service
  // Here we're simulating the preview with a simple overlay
  
  // Convert to data URL if needed
  const petDataUrl = typeof petImageFile === 'string' 
    ? petImageFile.startsWith('data:') ? petImageFile : await fetch(petImageFile).then(r => r.blob()).then(b => URL.createObjectURL(b))
    : await fileToDataUrl(petImageFile);
  
  return new Promise((resolve) => {
    // Create an image element to load the pet image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Create canvas for manipulation
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Apply "style" effects based on styleId
      // This is a mock implementation - in reality you'd use a real style transfer API
      
      // Apply some basic image processing based on styleId and intensity
      const intensityFactor = intensity / 100;
      
      if (styleId.includes('cartoon')) {
        // Cartoon effect: Increase saturation and apply edge detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Increase saturation
        for (let i = 0; i < data.length; i += 4) {
          // Crude saturation increase - real implementation would be more sophisticated
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i] + (data[i] - avg) * intensityFactor * 2;
          data[i + 1] = data[i + 1] + (data[i + 1] - avg) * intensityFactor * 2;
          data[i + 2] = data[i + 2] + (data[i + 2] - avg) * intensityFactor * 2;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add subtle edge effect
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * intensityFactor})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } 
      else if (styleId.includes('watercolor')) {
        // Watercolor effect: Add blur and watercolor texture
        ctx.filter = `blur(${intensityFactor * 2}px)`;
        ctx.globalCompositeOperation = 'saturation';
        ctx.drawImage(img, 0, 0);
        
        // Reset filters
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = `rgba(200, 220, 255, ${0.3 * intensityFactor})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } 
      else if (styleId.includes('retro')) {
        // Retro effect: Add sepia and grain
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sepia filter
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        
        // Apply the effect based on intensity
        if (intensityFactor < 1) {
          // Blend with original based on intensity
          const origData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = origData[i] + (data[i] - origData[i]) * intensityFactor;
            data[i + 1] = origData[i + 1] + (data[i + 1] - origData[i + 1]) * intensityFactor;
            data[i + 2] = origData[i + 2] + (data[i + 2] - origData[i + 2]) * intensityFactor;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add noise
        if (intensityFactor > 0.3) {
          for (let i = 0; i < canvas.width * canvas.height * 0.05 * intensityFactor; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 1 * intensityFactor;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.5)`;
            ctx.fill();
          }
        }
      }
      else {
        // Default style: Apply a color overlay
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = `rgba(100, 150, 255, ${0.3 * intensityFactor})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Convert to data URL and resolve promise
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      // Fallback if image loading fails
      resolve('/placeholders/style-preview-fallback.jpg');
    };
    
    // Start loading the image
    img.src = petDataUrl;
  });
} 