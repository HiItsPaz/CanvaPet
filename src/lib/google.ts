import * as vision from '@google-cloud/vision';

// The DetectPetResult interface stays the same to maintain compatibility
export interface DetectPetResult {
  isPet: boolean;
  confidence: number;
  animalType?: string;
  labels: {
    name: string;
    confidence: number;
  }[];
}

// Create a Google Cloud Vision client
// This requires the GOOGLE_APPLICATION_CREDENTIALS env var to point to a service account key file
// OR a JSON key directly in GOOGLE_CLOUD_CREDENTIALS
let visionClient: vision.v1.ImageAnnotatorClient;

try {
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS) 
    : undefined;
  
  visionClient = new vision.ImageAnnotatorClient({ 
    credentials,
    // Fallback to credentials file path if direct JSON not provided
    keyFilename: !credentials ? process.env.GOOGLE_APPLICATION_CREDENTIALS : undefined
  });
} catch (error) {
  console.error('Error initializing Google Vision client:', error);
  // Create a placeholder client that will produce errors when used
  // This allows the app to start even without credentials
  visionClient = {} as vision.v1.ImageAnnotatorClient;
}

/**
 * Detect if an image contains a pet (cat, dog, or other animal)
 * @param imageBuffer The image buffer to analyze
 * @returns An object with detection results
 */
export async function detectPet(imageBuffer: Buffer): Promise<DetectPetResult> {
  try {
    // Common pet categories to look for
    const petLabels = ['Cat', 'Dog', 'Pet', 'Animal', 'Mammal'];
    
    // Call the Google Vision API
    const [result] = await visionClient.labelDetection({
      image: { content: imageBuffer }
    });
    
    // Get the labels from the response
    const labels = result.labelAnnotations || [];
    
    // Find any matching pet labels
    const matchedPetLabels = labels.filter(
      (label: vision.protos.google.cloud.vision.v1.IEntityAnnotation) => 
        petLabels.includes(label.description || '')
    );
    
    // Get the highest confidence pet label
    const bestMatch = matchedPetLabels.sort(
      (a: vision.protos.google.cloud.vision.v1.IEntityAnnotation, b: vision.protos.google.cloud.vision.v1.IEntityAnnotation) => 
        (b.score || 0) - (a.score || 0)
    )[0];
    
    // Map Google's 0-1 confidence scores to 0-100 range 
    // to match our existing interface
    const normalizedLabels = labels.map((label: vision.protos.google.cloud.vision.v1.IEntityAnnotation) => ({
      name: label.description || '',
      confidence: (label.score || 0) * 100
    }));
    
    // Return structured result in the same format as AWS for compatibility
    return {
      isPet: matchedPetLabels.length > 0,
      confidence: bestMatch ? (bestMatch.score || 0) * 100 : 0,
      animalType: bestMatch?.description || undefined,
      labels: normalizedLabels
    };
  } catch (error) {
    console.error('Error detecting pets in image:', error);
    throw error;
  }
}

export default visionClient; 