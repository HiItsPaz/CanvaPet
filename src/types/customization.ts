export interface Style {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string; // URL to a small preview image of the style
  tags?: string[]; // e.g., ["cartoon", "colorful", "fun"]
  // Potentially other style-specific parameters like default intensity, required base model, etc.
}

// Example of how a style might be used with other customization options later
export interface CustomizationParameters {
  styleId: string | null;
  background?: {
    type: BackgroundType;
    value: string; // e.g., hex color, pattern URL, scene ID
  } | null;
  accessories?: string[]; // array of accessory IDs, implies they are toggleable
  styleIntensity?: number; // 0-100
  // ... other parameters
}

export type BackgroundType = "color" | "pattern" | "scene" | "transparent";

export interface BackgroundOption {
  id: string;
  name: string;
  type: BackgroundType;
  value: string; // Hex color, URL to pattern image, or identifier for a scene
  thumbnailUrl?: string; // Optional thumbnail for patterns/scenes
}

export interface Accessory {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl: string;
  category: string; // e.g., "hats", "glasses", "collars"
  // Potentially placement data, layer order, etc.
} 