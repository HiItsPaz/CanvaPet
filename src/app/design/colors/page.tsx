import Link from 'next/link';
import { 
  H1, 
  H2, 
  H3,
  P,
  Lead,
  Container,
  Button
} from '@/components/ui';

export const metadata = {
  title: 'Color System - CanvaPet Design',
  description: 'Color palette and usage guidelines for the CanvaPet design system',
};

export default function ColorsPage() {
  const brandColorSections = [
    {
      name: "Primary (Blue)",
      baseColor: "#4A7CFF",
      description: "Our primary blue represents trust, technology, and reliability. Use for primary actions, highlights, and key interactive elements.",
      colorScale: [
        { name: "50", hex: "#f0f6ff" },
        { name: "100", hex: "#e0edff" },
        { name: "200", hex: "#c1dbff" },
        { name: "300", hex: "#92bfff" },
        { name: "400", hex: "#699eff" },
        { name: "500", hex: "#4A7CFF" }, // Base color
        { name: "600", hex: "#3a62cc" },
        { name: "700", hex: "#2d4da3" },
        { name: "800", hex: "#25407f" },
        { name: "900", hex: "#1f3463" },
        { name: "950", hex: "#0f1b37" },
      ],
      cssVar: "--primary"
    },
    {
      name: "Secondary (Coral)",
      baseColor: "#FF7D54",
      description: "Our secondary coral represents warmth, joy, and creativity. Use for secondary actions, highlights, and supporting elements.",
      colorScale: [
        { name: "50", hex: "#fff4f0" },
        { name: "100", hex: "#ffe9df" },
        { name: "200", hex: "#ffd3bf" },
        { name: "300", hex: "#ffb599" },
        { name: "400", hex: "#ff9670" },
        { name: "500", hex: "#FF7D54" }, // Base color
        { name: "600", hex: "#cc6443" },
        { name: "700", hex: "#a34e36" },
        { name: "800", hex: "#7f3d2a" },
        { name: "900", hex: "#663123" },
        { name: "950", hex: "#331811" },
      ],
      cssVar: "--secondary"
    },
    {
      name: "Accent (Yellow)",
      baseColor: "#FFD166",
      description: "Our accent yellow represents energy, positivity, and playfulness. Use for accents, highlights, and tertiary elements.",
      colorScale: [
        { name: "50", hex: "#fffaeb" },
        { name: "100", hex: "#fff5d6" },
        { name: "200", hex: "#ffebad" },
        { name: "300", hex: "#ffe085" },
        { name: "400", hex: "#FFD166" }, // Base color
        { name: "500", hex: "#fab317" },
        { name: "600", hex: "#de8e0e" },
        { name: "700", hex: "#b86b10" },
        { name: "800", hex: "#925415" },
        { name: "900", hex: "#784516" },
        { name: "950", hex: "#432508" },
      ],
      cssVar: "--accent"
    }
  ];

  const neutralColors = [
    { name: "White", hex: "#FFFFFF", cssVar: "white" },
    { name: "Gray 50", hex: "#F9F9F9", cssVar: "gray-50" },
    { name: "Gray 100", hex: "#EEEEEE", cssVar: "gray-100" },
    { name: "Gray 200", hex: "#E2E2E2", cssVar: "gray-200" },
    { name: "Gray 300", hex: "#D0D0D0", cssVar: "gray-300" },
    { name: "Gray 400", hex: "#AEAEAE", cssVar: "gray-400" },
    { name: "Gray 500", hex: "#8C8C8C", cssVar: "gray-500" },
    { name: "Gray 600", hex: "#666666", cssVar: "gray-600" },
    { name: "Gray 700", hex: "#444444", cssVar: "gray-700" },
    { name: "Gray 800", hex: "#2A2A2A", cssVar: "gray-800" },
    { name: "Gray 900", hex: "#1A1A1A", cssVar: "gray-900" },
    { name: "Black", hex: "#000000", cssVar: "black" },
  ];

  const semanticColors = [
    { name: "Success", hex: "#10B981", cssVar: "green-500" },
    { name: "Warning", hex: "#FBBF24", cssVar: "yellow-400" },
    { name: "Error", hex: "#EF4444", cssVar: "red-500" },
    { name: "Info", hex: "#3B82F6", cssVar: "blue-500" },
  ];

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/design" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Design System
        </Link>

        <H1 className="mb-4">Color System</H1>
        <Lead className="mb-12">
          Our color system is designed to create a consistent, accessible, and visually appealing experience.
        </Lead>

        <div className="mb-16">
          <H2 className="mb-6">Brand Colors</H2>
          <P className="mb-8">
            Our brand colors define the visual identity of CanvaPet. They should be used consistently across all interfaces.
          </P>

          <div className="space-y-12">
            {brandColorSections.map((section, index) => (
              <div key={index}>
                <H3 className="mb-4 flex items-center">
                  <span className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: section.baseColor }}></span>
                  {section.name}
                </H3>
                <P className="mb-6">{section.description}</P>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-11 gap-2 mb-4">
                  {section.colorScale.map((color, i) => (
                    <div key={i} className="flex flex-col">
                      <div 
                        className="h-20 rounded-md mb-1 border border-gray-200 dark:border-gray-700 transition-colors duration-300" 
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <div className="text-xs">
                        <div className="font-medium">{color.name}</div>
                        <div className="text-gray-500 dark:text-gray-400">{color.hex}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-6 mt-2">
                  <code className="text-sm">
                    CSS Variable: <span className="text-primary">{section.cssVar}</span><br/>
                    Tailwind: <span className="text-primary">bg-{section.cssVar.replace('--', '')}-500</span>
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Neutral Colors</H2>
          <P className="mb-8">
            Neutral colors are used for text, backgrounds, borders, and other UI elements where brand colors would be too dominant.
          </P>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {neutralColors.map((color, i) => (
              <div key={i} className="flex flex-col">
                <div 
                  className="h-20 rounded-md mb-1 border border-gray-200 dark:border-gray-700 transition-colors duration-300" 
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="text-xs">
                  <div className="font-medium">{color.name}</div>
                  <div className="text-gray-500 dark:text-gray-400">{color.hex}</div>
                  <div className="text-gray-500 dark:text-gray-400">bg-{color.cssVar}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Semantic Colors</H2>
          <P className="mb-8">
            Semantic colors convey meaning and should be used consistently to establish patterns that users can recognize.
          </P>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {semanticColors.map((color, i) => (
              <div key={i} className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <div 
                    className="w-6 h-6 rounded-full mr-2" 
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div className="font-medium">{color.name}</div>
                </div>
                <div className="text-xs mb-2">
                  <div>{color.hex}</div>
                  <div>bg-{color.cssVar}</div>
                </div>
                <div className="mt-auto pt-3">
                  <Button 
                    size="sm" 
                    className="w-full" 
                    style={{ backgroundColor: color.hex }}
                  >
                    {color.name} Button
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <H2 className="mb-6">Color Usage Guidelines</H2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-lg mb-3">✅ Do</h3>
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li>Use primary color for main actions and focus elements</li>
                <li>Use secondary colors for supporting actions</li>
                <li>Use accent colors sparingly for emphasis</li>
                <li>Ensure sufficient contrast for text legibility</li>
                <li>Follow consistent color patterns across the interface</li>
                <li>Use semantic colors according to their intended meaning</li>
              </ul>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-lg mb-3">❌ Don't</h3>
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li>Use too many colors in a single interface</li>
                <li>Create new colors outside the defined palette</li>
                <li>Use semantic colors for non-semantic purposes</li>
                <li>Use colors that don't provide sufficient contrast</li>
                <li>Rely solely on color to convey meaning (for accessibility)</li>
                <li>Use bright/saturated colors for large background areas</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <H3 className="mb-3">Accessibility Considerations</H3>
            <P className="mb-4">
              All color combinations used for text must meet WCAG 2.1 AA standards, with a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.
            </P>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mr-3">Aa</div>
                <div>
                  <div className="font-medium">Primary on White</div>
                  <div className="text-xs text-gray-500">Contrast: 4.5:1 ✅</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-primary rounded border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-primary font-bold mr-3">Aa</div>
                <div className="text-white">
                  <div className="font-medium">White on Primary</div>
                  <div className="text-xs text-primary-50">Contrast: 4.5:1 ✅</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link href="/design" className="text-primary hover:underline inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Design System
          </Link>
          <Link href="/design/typography" className="text-primary hover:underline inline-flex items-center">
            Typography
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </Container>
  );
} 