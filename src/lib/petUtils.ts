import { DetectPetResult } from './google';

/**
 * Check if an image contains a pet using the pet detection API
 * @param file Image file to detect pets
 * @returns Detection results
 */
export async function checkIsPet(file: File): Promise<DetectPetResult> {
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Call the pet detection API endpoint
    const response = await fetch('/api/pet-detection', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to detect pet');
    }
    
    // Parse and return the response
    return await response.json();
  } catch (error: unknown) {
    console.error('Error checking pet status:', error);
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
}

/**
 * Check if an image contains a pet using base64 image data
 * @param base64Data Base64 encoded image data
 * @returns Detection results
 */
export async function checkIsPetFromBase64(base64Data: string): Promise<DetectPetResult> {
  try {
    // Call the pet detection API endpoint with base64 data
    const response = await fetch('/api/pet-detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64: base64Data }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to detect pet');
    }
    
    // Parse and return the response
    return await response.json();
  } catch (error: unknown) {
    console.error('Error checking pet status from base64:', error);
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
}

/**
 * Formats pet detection results into a human-readable message
 * @param result Detection results from the API
 * @returns Formatted message string
 */
export function formatPetDetectionResult(result: DetectPetResult): string {
  if (!result.isPet) {
    return "No pet detected in this image. Please upload a photo of your pet.";
  }
  
  const confidencePercent = Math.round(result.confidence);
  const animalType = result.animalType || 'Animal';
  
  if (confidencePercent < 80) {
    return `Possible ${animalType.toLowerCase()} detected (${confidencePercent}% confidence).`;
  }
  
  return `${animalType} detected! (${confidencePercent}% confidence)`;
} 