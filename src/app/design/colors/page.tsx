import { ColorPalette } from '@/components/ui/color-palette';

export const metadata = {
  title: 'CanvaPet Color System',
  description: 'Color palette and design system documentation for the CanvaPet application',
};

export default function ColorsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Color System</h1>
        <p className="text-muted-foreground mb-8">
          Documentation and examples of the CanvaPet color palette and design system.
        </p>
        
        <div className="bg-card p-6 rounded-lg border">
          <ColorPalette />
        </div>
        
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold">Usage Guidelines</h2>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Color Naming Convention</h3>
            <p className="text-muted-foreground">
              All colors are accessible through Tailwind&apos;s utility classes. The brand colors are defined as follows:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Primary Blue: <code className="bg-muted px-1 py-0.5 rounded">bg-primary</code> or <code className="bg-muted px-1 py-0.5 rounded">bg-primary-500</code> (for specific shade)</li>
              <li>Coral: <code className="bg-muted px-1 py-0.5 rounded">bg-secondary</code> or <code className="bg-muted px-1 py-0.5 rounded">bg-secondary-500</code> (for specific shade)</li>
              <li>Yellow: <code className="bg-muted px-1 py-0.5 rounded">bg-accent</code> or <code className="bg-muted px-1 py-0.5 rounded">bg-accent-400</code> (for specific shade)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Accessibility</h3>
            <p className="text-muted-foreground">
              The color system has been designed to meet WCAG AA accessibility standards. When using these colors, ensure:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Text on colored backgrounds has sufficient contrast (minimum 4.5:1 for normal text, 3:1 for large text)</li>
              <li>Don&apos;t rely solely on color to convey information</li>
              <li>Use the provided text-*-foreground classes paired with background colors</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Dark Mode</h3>
            <p className="text-muted-foreground">
              The color system automatically adjusts for dark mode using CSS variables. No additional work is needed - 
              simply use the semantic color classes like <code className="bg-muted px-1 py-0.5 rounded">bg-primary</code> and they will respond to the theme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 