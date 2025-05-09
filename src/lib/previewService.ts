import { CustomizationParameters } from "@/types/customization";
import { getCustomization, saveCustomization as saveCustomizationToDb } from "./customizationApi";

// Mapping of style IDs to their effect names for the backend
const STYLE_EFFECT_MAP: Record<string, string> = {
  "realistic": "photo_realistic",
  "cartoon": "cartoon_style",
  "watercolor": "watercolor_painting",
  "oil-painting": "oil_painting",
  "pop-art": "pop_art_style",
  "pencil-sketch": "pencil_sketch",
  "fantasy-art": "fantasy_realm",
};

// Interface for the preview request payload
interface PreviewRequestPayload {
  petId: string;
  style: string;
  styleIntensity?: number;
  background?: {
    type: string;
    value: string;
  };
  accessories?: string[];
  width?: number;
  height?: number;
}

// Interface for the preview response
interface PreviewResponse {
  previewUrl: string;
  previewId?: string;
  status: "success" | "processing" | "error";
  message?: string;
}

/**
 * Generate a preview image based on customization parameters
 */
export async function generatePreview(
  petId: string,
  parameters: CustomizationParameters,
  options: { width?: number; height?: number } = {}
): Promise<string> {
  try {
    // In a production environment, this would call your backend API
    // For now, we'll simulate with a mock implementation
    
    // Prepare request payload
    const payload: PreviewRequestPayload = {
      petId,
      style: parameters.styleId ? STYLE_EFFECT_MAP[parameters.styleId] || parameters.styleId : "photo_realistic",
      styleIntensity: parameters.styleIntensity,
      background: parameters.background || undefined,
      accessories: parameters.accessories,
      width: options.width || 512,
      height: options.height || 512,
    };
    
    console.log("Generating preview with parameters:", payload);
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For a real implementation, you would:
    // 1. Make a fetch call to your API endpoint
    // 2. Wait for the processing to complete
    // 3. Return the URL to the generated image
    
    // Mock response
    const mockResponse: PreviewResponse = {
      previewUrl: getMockPreviewUrl(parameters.styleId),
      previewId: `preview-${Date.now()}`,
      status: "success",
    };
    
    return mockResponse.previewUrl;
  } catch (error) {
    console.error("Error generating preview:", error);
    throw new Error("Failed to generate preview image");
  }
}

/**
 * Save a customization to the database
 */
export async function saveCustomization(
  petId: string,
  parameters: CustomizationParameters
): Promise<void> {
  try {
    // Get the preview URL (in a real implementation this would come from the preview service)
    const previewUrl = getMockPreviewUrl(parameters.styleId);
    
    // Save to the database
    const customizationId = await saveCustomizationToDb(petId, parameters, previewUrl);
    
    if (!customizationId) {
      throw new Error("Failed to save customization");
    }
    
    console.log("Customization saved successfully with ID:", customizationId);
  } catch (error) {
    console.error("Error saving customization:", error);
    throw new Error("Failed to save customization");
  }
}

/**
 * Fetch existing customization parameters for a pet
 */
export async function fetchCustomization(
  petId: string
): Promise<CustomizationParameters | null> {
  try {
    // Fetch from the database
    const parameters = await getCustomization(petId);
    
    if (parameters) {
      console.log("Fetched existing customization for pet:", petId);
      return parameters;
    }
    
    console.log("No existing customization found for pet:", petId);
    return null;
  } catch (error) {
    console.error("Error fetching customization:", error);
    return null;
  }
}

// Helper function to get a mock preview URL based on the selected style
function getMockPreviewUrl(styleId: string | null): string {
  const baseUrl = "/placeholders";
  
  switch (styleId) {
    case "realistic":
      return `${baseUrl}/preview-realistic.jpg`;
    case "cartoon":
      return `${baseUrl}/preview-cartoon.jpg`;
    case "watercolor":
      return `${baseUrl}/preview-watercolor.jpg`;
    case "oil-painting":
      return `${baseUrl}/preview-oil.jpg`;
    case "pop-art":
      return `${baseUrl}/preview-popart.jpg`;
    case "pencil-sketch":
      return `${baseUrl}/preview-sketch.jpg`;
    case "fantasy-art":
      return `${baseUrl}/preview-fantasy.jpg`;
    default:
      return `${baseUrl}/preview-result.jpg`;
  }
} 