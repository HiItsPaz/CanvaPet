import React from 'react';

type ColorSwatch = {
  name: string;
  hex: string;
  variable?: string;
  className?: string;
};

type ColorPaletteProps = {
  title: string;
  colors: ColorSwatch[];
};

const ColorGroup = ({ title, colors }: ColorPaletteProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {colors.map((color) => (
          <div key={color.name} className="flex flex-col">
            <div
              className={`h-20 rounded-t-md ${color.className || ''}`}
              style={{ backgroundColor: color.hex }}
            ></div>
            <div className="p-2 text-xs rounded-b-md border border-t-0 space-y-1">
              <p className="font-medium">{color.name}</p>
              <p className="font-mono">{color.hex}</p>
              {color.variable && <p className="font-mono text-muted-foreground">{color.variable}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function ColorPalette() {
  const primaryColors: ColorSwatch[] = [
    { name: 'Primary 50', hex: '#f0f6ff', className: 'border border-border' },
    { name: 'Primary 100', hex: '#e0edff', className: 'border border-border' },
    { name: 'Primary 200', hex: '#c1dbff' },
    { name: 'Primary 300', hex: '#92bfff' },
    { name: 'Primary 400', hex: '#699eff' },
    { name: 'Primary 500', hex: '#4A7CFF', variable: '--primary' },
    { name: 'Primary 600', hex: '#3a62cc' },
    { name: 'Primary 700', hex: '#2d4da3' },
    { name: 'Primary 800', hex: '#25407f' },
    { name: 'Primary 900', hex: '#1f3463' },
    { name: 'Primary 950', hex: '#0f1b37' },
  ];

  const secondaryColors: ColorSwatch[] = [
    { name: 'Coral 50', hex: '#fff4f0', className: 'border border-border' },
    { name: 'Coral 100', hex: '#ffe9df', className: 'border border-border' },
    { name: 'Coral 200', hex: '#ffd3bf' },
    { name: 'Coral 300', hex: '#ffb599' },
    { name: 'Coral 400', hex: '#ff9670' },
    { name: 'Coral 500', hex: '#FF7D54', variable: '--secondary' },
    { name: 'Coral 600', hex: '#cc6443' },
    { name: 'Coral 700', hex: '#a34e36' },
    { name: 'Coral 800', hex: '#7f3d2a' },
    { name: 'Coral 900', hex: '#663123' },
    { name: 'Coral 950', hex: '#331811' },
  ];

  const accentColors: ColorSwatch[] = [
    { name: 'Yellow 50', hex: '#fffaeb', className: 'border border-border' },
    { name: 'Yellow 100', hex: '#fff5d6', className: 'border border-border' },
    { name: 'Yellow 200', hex: '#ffebad' },
    { name: 'Yellow 300', hex: '#ffe085' },
    { name: 'Yellow 400', hex: '#FFD166', variable: '--accent' },
    { name: 'Yellow 500', hex: '#fab317' },
    { name: 'Yellow 600', hex: '#de8e0e' },
    { name: 'Yellow 700', hex: '#b86b10' },
    { name: 'Yellow 800', hex: '#925415' },
    { name: 'Yellow 900', hex: '#784516' },
    { name: 'Yellow 950', hex: '#432508' },
  ];

  const utilityColors: ColorSwatch[] = [
    { name: 'Background', hex: '#FFFFFF', variable: '--background', className: 'border border-border' },
    { name: 'Foreground', hex: '#0A0A0A', variable: '--foreground' },
    { name: 'Card', hex: '#FFFFFF', variable: '--card', className: 'border border-border' },
    { name: 'Muted', hex: '#F2F4F7', variable: '--muted' },
    { name: 'Border', hex: '#E5E8ED', variable: '--border' },
  ];

  const cssVariableClasses: ColorSwatch[] = [
    { name: 'Primary', hex: '#4A7CFF', className: 'bg-primary text-primary-foreground' },
    { name: 'Secondary', hex: '#FF7D54', className: 'bg-secondary text-secondary-foreground' },
    { name: 'Accent', hex: '#FFD166', className: 'bg-accent text-accent-foreground' },
    { name: 'Muted', hex: '#F2F4F7', className: 'bg-muted text-muted-foreground' },
    { name: 'Destructive', hex: '#EF4444', className: 'bg-destructive text-destructive-foreground' },
  ];

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">CanvaPet Color System</h2>
      <p className="text-muted-foreground mb-8">
        This is the official color palette for the CanvaPet application. The primary blue (#4A7CFF), coral (#FF7D54), 
        and yellow (#FFD166) colors form the core brand identity, with appropriate variations
        for different UI elements and states.
      </p>

      <ColorGroup title="Primary Blue" colors={primaryColors} />
      <ColorGroup title="Secondary Coral" colors={secondaryColors} />
      <ColorGroup title="Accent Yellow" colors={accentColors} />
      <ColorGroup title="UI System Colors" colors={utilityColors} />
      
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-3">CSS Variable Classes</h3>
        <p className="text-muted-foreground mb-4">
          These classes can be used directly in your components using Tailwind utility classes.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cssVariableClasses.map((color) => (
            <div key={color.name} className={`p-4 rounded-md ${color.className}`}>
              <p className="font-medium">{color.name}</p>
              <p className="text-xs mt-1">text-{color.name.toLowerCase()}-foreground</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dark mode notice */}
      <div className="mt-12 p-4 bg-muted rounded-md">
        <h3 className="text-lg font-semibold">Dark Mode</h3>
        <p className="text-muted-foreground">
          The color system automatically adjusts for dark mode. Toggle dark mode to see the adjusted color palette.
        </p>
      </div>
    </div>
  );
} 