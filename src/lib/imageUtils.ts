import imageCompression from 'browser-image-compression';
import imageSize from 'image-size';
import { Buffer } from 'buffer'; // Make sure Buffer is available

// Local interface for image dimensions if ISizeCalculationResult is hard to import
interface ImageDimensions {
  width?: number;
  height?: number;
  type?: string; // image-size might return other properties like type
  // Add other potential properties if known
}

// Accepted file types for pet images
export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Target compressed size (1MB)
export const TARGET_SIZE_MB = 1;

// Configuration for image compression
export const compressionOptions = {
  maxSizeMB: TARGET_SIZE_MB,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  preserveExif: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8,
};

/**
 * Validate an uploaded file for accepted type and size
 * @param file The file to validate
 * @returns An object with validation result and error message if invalid
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
    return {
      valid: false,
      error: 'File type not accepted. Please upload a JPG, PNG, WebP, or HEIC file.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Compress an image file for upload
 * @param file The image file to compress
 * @param options Custom compression options (optional)
 * @returns Promise that resolves to the compressed file
 */
export async function compressImage(
  file: File,
  options?: Partial<imageCompression.Options>
): Promise<File> {
  try {
    // For small images, don't compress if they're already under the target size
    if (file.size <= TARGET_SIZE_MB * 1024 * 1024) {
      console.log('Image already smaller than target size, skipping compression');
      return file;
    }

    const mergedOptions = {
      ...compressionOptions,
      ...options,
    };

    const compressedFile = await imageCompression(file, mergedOptions);
    
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Extract EXIF metadata from image
 * @param file The image file to process
 * @returns Promise that resolves to metadata object
 */
export async function extractMetadata(file: File): Promise<Record<string, unknown>> {
  // This is a placeholder - in a full implementation, we'd use a library
  // like exif-js to extract and parse EXIF data
  
  return {
    timestamp: new Date().toISOString(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };
}

/**
 * Convert a Data URL to a File object
 * @param dataUrl The data URL string
 * @param filename Name for the resulting file
 * @returns File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Gets the dimensions of an image from its URL (Server-Side).
 * Fetches the image content and uses the 'image-size' library.
 * 
 * @param imageUrl The URL of the image.
 * @returns Promise<{ width: number; height: number } | null>
 */
export async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number } | null> {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const dimensions: ImageDimensions = imageSize(buffer); // Used local ImageDimensions interface
    
    if (dimensions && dimensions.width && dimensions.height) {
      return { width: dimensions.width, height: dimensions.height };
    } else {
      console.warn(`Could not determine dimensions for image: ${imageUrl}`);
      return null;
    }

  } catch (error) {
    console.error(`Failed to get dimensions for image ${imageUrl}:`, error);
    return null;
  }
}

// Function to calculate the required scale factor
export function calculateScaleFactor(originalWidth: number, originalHeight: number, targetWidth: number, targetHeight?: number): number {
  if (!originalWidth || !originalHeight || !targetWidth) {
    return 1; // Default to no scaling if inputs are invalid
  }

  const targetLongerEdge = targetHeight ? Math.max(targetWidth, targetHeight) : targetWidth;
  const originalLongerEdge = Math.max(originalWidth, originalHeight);

  if (originalLongerEdge >= targetLongerEdge) {
    return 1; // No upscaling needed if original is already large enough
  }

  const requiredScale = targetLongerEdge / originalLongerEdge;

  // Clamp to supported scales (e.g., 1x, 2x, 4x for Real-ESRGAN)
  // Adjust this logic based on the upscaler's capabilities
  if (requiredScale <= 1.2) return 1; // If only slightly smaller, don't upscale
  if (requiredScale <= 2.5) return 2;
  // Add more steps if needed (e.g., 3x)
  return 4; // Max scale
}

/**
 * Validates image dimensions after loading
 * @param file The file to check dimensions for
 * @returns Promise with validation result and error message if invalid
 */
export async function validateImageDimensions(file: File): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Minimum dimensions check (100x100 pixels)
        if (img.width < 100 || img.height < 100) {
          resolve({
            valid: false,
            error: 'Image is too small. Minimum dimensions are 100x100 pixels.',
            dimensions: { width: img.width, height: img.height }
          });
          return;
        }
        
        // Maximum dimensions check (8000x8000 pixels)
        if (img.width > 8000 || img.height > 8000) {
          resolve({
            valid: false,
            error: 'Image is too large. Maximum dimensions are 8000x8000 pixels.',
            dimensions: { width: img.width, height: img.height }
          });
          return;
        }
        
        // Valid dimensions
        resolve({
          valid: true,
          dimensions: { width: img.width, height: img.height }
        });
      };
      
      img.onerror = () => {
        resolve({
          valid: false,
          error: 'Failed to load image. The file may be corrupted.'
        });
      };
      
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        resolve({
          valid: false,
          error: 'Failed to read image file.'
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        valid: false,
        error: 'Failed to read image file.'
      });
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Checks image quality factors such as brightness and blur
 * @param file The image file to check
 * @returns Promise with quality assessment results
 */
export async function assessImageQuality(file: File): Promise<{ 
  isAcceptable: boolean; 
  warnings: string[];
  tooDark?: boolean; 
  tooBlurry?: boolean;
  lowResolution?: boolean;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({ 
            isAcceptable: true,  // Default to accepting if we can't analyze
            warnings: ['Could not analyze image quality.'] 
          });
          return;
        }
        
        // Set canvas size to image dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Initialize variables for quality checks
        let totalBrightness = 0;
        let pixelCount = data.length / 4;
        
        // Calculate average brightness
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Luminance formula: 0.299*R + 0.587*G + 0.114*B
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += brightness;
        }
        
        const avgBrightness = totalBrightness / pixelCount;
        const tooDark = avgBrightness < 40;  // Threshold for dark images
        
        // For blur detection, we use a simple heuristic
        // A more accurate implementation would use edge detection algorithms
        const lowResolution = img.width < 500 || img.height < 500;
        
        // Collect warnings
        const warnings = [];
        if (tooDark) {
          warnings.push('The image appears to be too dark. Consider using a better lit photo for best results.');
        }
        
        if (lowResolution) {
          warnings.push('The image has relatively low resolution. For best results, use a higher resolution photo.');
        }
        
        resolve({
          isAcceptable: warnings.length === 0,
          warnings,
          tooDark,
          lowResolution
        });
      };
      
      img.onerror = () => {
        resolve({
          isAcceptable: false,
          warnings: ['Failed to analyze image quality. The file may be corrupted.']
        });
      };
      
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        resolve({
          isAcceptable: false,
          warnings: ['Failed to read image file for quality assessment.']
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        isAcceptable: false,
        warnings: ['Failed to read image file for quality assessment.']
      });
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Enhanced validation with additional quality checks
 * @param file The file to validate
 * @param options Additional validation options
 * @returns Promise with validation results and messages
 */
export async function validateImageWithQuality(
  file: File, 
  options: { 
    checkDimensions?: boolean; 
    checkQuality?: boolean; 
    strictValidation?: boolean; // Add option for strict validation
  } = { checkDimensions: true, checkQuality: true, strictValidation: false }
): Promise<{ 
  valid: boolean;
  error?: string;
  warnings: string[];
  dimensions?: { width: number; height: number };
  quality?: { 
    tooDark?: boolean;
    tooBlurry?: boolean;
    lowResolution?: boolean; 
  };
}> {
  // Start with basic validation
  const basicValidation = validateFile(file);
  if (!basicValidation.valid) {
    return {
      valid: false,
      error: basicValidation.error,
      warnings: []
    };
  }
  
  let dimensionsResult: { 
    valid: boolean; 
    error?: string; 
    dimensions?: { width: number; height: number } 
  } = { valid: true };
  
  let qualityResult: { 
    isAcceptable: boolean; 
    warnings: string[]; 
    tooDark?: boolean; 
    tooBlurry?: boolean; 
    lowResolution?: boolean; 
  } = { isAcceptable: true, warnings: [] };
  
  // Check dimensions if requested
  if (options.checkDimensions) {
    dimensionsResult = await validateImageDimensions(file);
    if (!dimensionsResult.valid) {
      return {
        valid: false,
        error: dimensionsResult.error,
        warnings: [],
        dimensions: dimensionsResult.dimensions
      };
    }
  }
  
  // Check quality if requested
  if (options.checkQuality) {
    qualityResult = await assessImageQuality(file);
    
    // In strict validation mode, fail if quality issues are found
    if (options.strictValidation && !qualityResult.isAcceptable) {
      return {
        valid: false,
        error: "Image quality does not meet requirements",
        warnings: qualityResult.warnings,
        dimensions: dimensionsResult.dimensions,
        quality: {
          tooDark: qualityResult.tooDark,
          tooBlurry: qualityResult.tooBlurry,
          lowResolution: qualityResult.lowResolution
        }
      };
    }
  }
  
  return {
    valid: true,
    warnings: qualityResult.warnings,
    dimensions: dimensionsResult.dimensions,
    quality: {
      tooDark: qualityResult.tooDark,
      tooBlurry: qualityResult.tooBlurry,
      lowResolution: qualityResult.lowResolution
    }
  };
}

/**
 * Helper function to get display-friendly warnings based on validation results
 * @param validation The validation result object
 * @returns Array of human-readable warning messages
 */
export function getReadableValidationWarnings(validation: { 
  valid: boolean;
  quality?: { 
    tooDark?: boolean;
    tooBlurry?: boolean;
    lowResolution?: boolean; 
  };
}): string[] {
  const warnings: string[] = [];
  
  if (!validation.valid) {
    return warnings; // Return empty array for invalid images
  }
  
  if (validation.quality?.tooDark) {
    warnings.push("The image appears too dark. This may affect the quality of the generated portrait.");
  }
  
  if (validation.quality?.tooBlurry) {
    warnings.push("The image appears blurry. Clear images produce better results.");
  }
  
  if (validation.quality?.lowResolution) {
    warnings.push("The image has low resolution. Higher resolution images produce better results.");
  }
  
  return warnings;
} 