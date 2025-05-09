import React from "react";

type RGBColor = {
  r: number;
  g: number;
  b: number;
};

type ContrastCheckerProps = {
  backgroundColor: string;
  foregroundColor: string;
  showDetails?: boolean;
  children?: React.ReactNode;
};

// Convert hex color to RGB
function hexToRgb(hex: string): RGBColor | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex format (either 3 or 6 chars)
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return null;
  }
  
  return { r, g, b };
}

// Calculate relative luminance for a color
function getLuminance(color: RGBColor): number {
  const { r, g, b } = color;
  
  // Normalize RGB values
  const rsrgb = r / 255;
  const gsrgb = g / 255;
  const bsrgb = b / 255;
  
  // Calculate RGB values in linear RGB space
  const rLin = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const gLin = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const bLin = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
  
  // Calculate luminance (per WCAG 2.0)
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

// Calculate contrast ratio between two colors
function getContrastRatio(bg: RGBColor, fg: RGBColor): number {
  const bgLuminance = getLuminance(bg);
  const fgLuminance = getLuminance(fg);
  
  // Ensure the lighter color is always divided by the darker color
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Determine WCAG compliance level
function getComplianceLevel(ratio: number): string {
  if (ratio >= 7) {
    return "AAA";
  } else if (ratio >= 4.5) {
    return "AA";
  } else if (ratio >= 3) {
    return "AA Large";
  } else {
    return "Fail";
  }
}

export function ContrastChecker({
  backgroundColor,
  foregroundColor,
  showDetails = true,
  children
}: ContrastCheckerProps) {
  const bgRgb = hexToRgb(backgroundColor);
  const fgRgb = hexToRgb(foregroundColor);
  
  let contrastRatio = 1;
  let complianceLevel = "Unknown";
  
  if (bgRgb && fgRgb) {
    contrastRatio = getContrastRatio(bgRgb, fgRgb);
    complianceLevel = getComplianceLevel(contrastRatio);
  }

  // Determine badge color based on compliance level
  const getBadgeColor = () => {
    switch (complianceLevel) {
      case "AAA": return "bg-green-500 text-white";
      case "AA": return "bg-blue-500 text-white";
      case "AA Large": return "bg-yellow-500 text-black";
      default: return "bg-red-500 text-white";
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div 
        className="p-4 font-medium"
        style={{ backgroundColor, color: foregroundColor }}
      >
        {children || "Sample Text"}
      </div>
      
      {showDetails && (
        <div className="p-3 bg-muted text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span>Contrast Ratio</span>
            <span className="font-semibold">{contrastRatio.toFixed(2)}:1</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>WCAG Compliance</span>
            <span className={`px-2 py-0.5 rounded ${getBadgeColor()}`}>
              {complianceLevel}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor }}
                ></div>
                <span>Background</span>
              </div>
              <code className="text-xs">{backgroundColor}</code>
            </div>
            
            <div>
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: foregroundColor }}
                ></div>
                <span>Foreground</span>
              </div>
              <code className="text-xs">{foregroundColor}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 