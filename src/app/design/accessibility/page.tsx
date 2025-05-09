import React from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/';
import { ContrastChecker } from '@/components/ui/contrast-checker';

export const metadata = {
  title: 'CanvaPet Accessibility',
  description: 'Accessibility evaluation of the CanvaPet color system',
};

// Helper component to show contrast information with class names
const ContrastCheck = ({ background, foreground, children }: { 
  background: string, 
  foreground: string, 
  children: React.ReactNode 
}) => (
  <div className={`p-4 ${background} rounded-lg mb-4`}>
    <div className={`${foreground} mb-1 font-medium`}>
      {children}
    </div>
    <div className="text-xs">
      Background: <code>{background}</code>, Foreground: <code>{foreground}</code>
    </div>
  </div>
);

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Accessibility Evaluation</h1>
        <p className="text-muted-foreground mb-8">
          WCAG compliance testing for CanvaPet&apos;s color system.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Color Contrast Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Text on Background Colors</CardTitle>
              <CardDescription>Testing foreground text on various background colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContrastCheck background="bg-primary" foreground="text-primary-foreground">
                Primary text on primary background
              </ContrastCheck>
              
              <ContrastCheck background="bg-secondary" foreground="text-secondary-foreground">
                Secondary text on secondary background
              </ContrastCheck>
              
              <ContrastCheck background="bg-accent" foreground="text-accent-foreground">
                Accent text on accent background
              </ContrastCheck>
              
              <ContrastCheck background="bg-muted" foreground="text-muted-foreground">
                Muted text on muted background
              </ContrastCheck>
              
              <ContrastCheck background="bg-destructive" foreground="text-destructive-foreground">
                Text on destructive background
              </ContrastCheck>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Interactive Elements</CardTitle>
              <CardDescription>Testing contrast ratios for buttons and interactive components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="default" className="w-full justify-start">Primary Button</Button>
                <div className="text-xs text-muted-foreground">
                  Background: primary, Text: primary-foreground
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start">Secondary Button</Button>
                <div className="text-xs text-muted-foreground">
                  Background: secondary, Text: secondary-foreground
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="accent" className="w-full justify-start">Accent Button</Button>
                <div className="text-xs text-muted-foreground">
                  Background: accent, Text: accent-foreground
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="destructive" className="w-full justify-start">Destructive Button</Button>
                <div className="text-xs text-muted-foreground">
                  Background: destructive, Text: destructive-foreground
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Contrast Ratio Analysis</CardTitle>
            <CardDescription>
              Precise accessibility measurements using WCAG 2.1 guidelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ContrastChecker 
                backgroundColor="#4A7CFF" 
                foregroundColor="#FFFFFF"
              >
                Primary Blue + White
              </ContrastChecker>
              
              <ContrastChecker 
                backgroundColor="#FF7D54" 
                foregroundColor="#FFFFFF"
              >
                Coral + White
              </ContrastChecker>
              
              <ContrastChecker 
                backgroundColor="#FFD166" 
                foregroundColor="#1F2937"
              >
                Yellow + Dark Gray
              </ContrastChecker>
              
              <ContrastChecker 
                backgroundColor="#FFFFFF" 
                foregroundColor="#4A7CFF"
              >
                White + Primary Blue
              </ContrastChecker>
              
              <ContrastChecker 
                backgroundColor="#1F2937" 
                foregroundColor="#4A7CFF"
              >
                Dark Background + Primary Blue
              </ContrastChecker>
              
              <ContrastChecker 
                backgroundColor="#1F2937" 
                foregroundColor="#FF7D54"
              >
                Dark Background + Coral
              </ContrastChecker>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Color Vision Deficiency Simulation</CardTitle>
            <CardDescription>
              How our color palette appears to users with different color vision deficiencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Normal Vision</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="w-16 h-16 bg-primary rounded"></div>
                  <div className="w-16 h-16 bg-secondary rounded"></div>
                  <div className="w-16 h-16 bg-accent rounded"></div>
                  <div className="w-16 h-16 bg-muted rounded"></div>
                  <div className="w-16 h-16 bg-destructive rounded"></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Protanopia (Red-Blind) Simulation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Note: This is a visual representation only. Real testing should use specialized tools.
                </p>
                <div className="flex flex-wrap gap-2 filter-protanopia">
                  <div className="w-16 h-16 bg-primary rounded"></div>
                  <div className="w-16 h-16 bg-secondary rounded"></div>
                  <div className="w-16 h-16 bg-accent rounded"></div>
                  <div className="w-16 h-16 bg-muted rounded"></div>
                  <div className="w-16 h-16 bg-destructive rounded"></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Deuteranopia (Green-Blind) Simulation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Note: This is a visual representation only. Real testing should use specialized tools.
                </p>
                <div className="flex flex-wrap gap-2 filter-deuteranopia">
                  <div className="w-16 h-16 bg-primary rounded"></div>
                  <div className="w-16 h-16 bg-secondary rounded"></div>
                  <div className="w-16 h-16 bg-accent rounded"></div>
                  <div className="w-16 h-16 bg-muted rounded"></div>
                  <div className="w-16 h-16 bg-destructive rounded"></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Tritanopia (Blue-Blind) Simulation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Note: This is a visual representation only. Real testing should use specialized tools.
                </p>
                <div className="flex flex-wrap gap-2 filter-tritanopia">
                  <div className="w-16 h-16 bg-primary rounded"></div>
                  <div className="w-16 h-16 bg-secondary rounded"></div>
                  <div className="w-16 h-16 bg-accent rounded"></div>
                  <div className="w-16 h-16 bg-muted rounded"></div>
                  <div className="w-16 h-16 bg-destructive rounded"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Guidelines</CardTitle>
            <CardDescription>
              Best practices for using our color system in an accessible way
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">WCAG 2.1 AA Compliance</h3>
                <p className="mb-2">
                  Our color system is designed to meet WCAG 2.1 AA standards, which require:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Text contrast ratio of at least 4.5:1 for normal text</li>
                  <li>Text contrast ratio of at least 3:1 for large text (18pt+)</li>
                  <li>Contrast ratio of at least 3:1 for UI components and graphical objects</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Usage Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Always use the paired foreground colors with their respective backgrounds</li>
                  <li>Avoid relying on color alone to convey meaning; add text labels or icons</li>
                  <li>Use the destructive color sparingly and only for critical actions</li>
                  <li>Ensure focus states have sufficient contrast (3:1 minimum)</li>
                  <li>Test with actual screen readers during development</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Testing Tools</h3>
                <p className="mb-2">
                  We recommend using these tools to verify accessibility:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>WebAIM Contrast Checker</li>
                  <li>Axe DevTools</li>
                  <li>Lighthouse Accessibility Audits</li>
                  <li>Color Oracle (for color blindness simulation)</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Contact the design team for help with accessibility concerns or questions.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 