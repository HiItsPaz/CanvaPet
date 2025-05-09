import React from 'react';

export default function AccessibilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* SVG Filters for Color Vision Deficiency Simulation */}
      <div className="vision-deficiency-filters">
        <svg aria-hidden="true">
          <defs>
            {/* Protanopia (Red-Blind) Filter */}
            <filter id="protanopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.567, 0.433, 0, 0, 0
                        0.558, 0.442, 0, 0, 0
                        0, 0.242, 0.758, 0, 0
                        0, 0, 0, 1, 0"
              />
            </filter>
            
            {/* Deuteranopia (Green-Blind) Filter */}
            <filter id="deuteranopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.625, 0.375, 0, 0, 0
                        0.7, 0.3, 0, 0, 0
                        0, 0.3, 0.7, 0, 0
                        0, 0, 0, 1, 0"
              />
            </filter>
            
            {/* Tritanopia (Blue-Blind) Filter */}
            <filter id="tritanopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.95, 0.05, 0, 0, 0
                        0, 0.433, 0.567, 0, 0
                        0, 0.475, 0.525, 0, 0
                        0, 0, 0, 1, 0"
              />
            </filter>
          </defs>
        </svg>
      </div>
      
      {children}
    </>
  );
} 