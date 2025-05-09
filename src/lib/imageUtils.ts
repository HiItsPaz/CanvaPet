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