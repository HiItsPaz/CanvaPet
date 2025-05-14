import Link from 'next/link';
import { 
  H1, 
  H2, 
  H3,
  P,
  Lead,
  Container,
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import { ContrastChecker } from '@/components/ui/contrast-checker';

export const metadata = {
  title: 'Accessibility - CanvaPet Design',
  description: 'Accessibility guidelines and evaluation of the CanvaPet design system',
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
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/design" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Design System
        </Link>

        <H1 className="mb-4">Accessibility</H1>
        <Lead className="mb-12">
          Guidelines and evaluations to ensure our design system meets WCAG standards and provides an inclusive experience for all users.
        </Lead>
        
        <div className="mb-16">
          <H2 className="mb-6">Color Contrast Analysis</H2>
          <P className="mb-8">
            Color contrast is essential for users with visual impairments. We ensure all text and interactive elements meet WCAG 2.1 AA standards.
          </P>
          
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
        </div>
        
        <div className="mb-16">
          <H2 className="mb-6">Color Vision Deficiency Considerations</H2>
          <P className="mb-8">
            We design with color blindness in mind, ensuring our interfaces remain usable for people with various color vision deficiencies.
          </P>
          
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
        </div>
        
        <div className="mb-16">
          <H2 className="mb-6">Accessibility Guidelines</H2>
          <P className="mb-8">
            Follow these guidelines to ensure all interfaces created with our design system are accessible to everyone.
          </P>
          
          <Card>
            <CardHeader>
              <CardTitle>WCAG 2.1 AA Compliance</CardTitle>
              <CardDescription>
                Best practices for using our color system in an accessible way
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">WCAG 2.1 AA Requirements</h3>
                  <p className="mb-2">
                    Our color system is designed to meet WCAG 2.1 AA standards, which require:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Text contrast ratio of at least 4.5:1 for normal text</li>
                    <li>Text contrast ratio of at least 3:1 for large text (18pt+)</li>
                    <li>Contrast ratio of at least 3:1 for UI components and graphical objects</li>
                  </ul>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Beyond Color Contrast</h3>
                  <p className="mb-2">Additional accessibility considerations:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Don&apos;t rely solely on color to convey information</li>
                    <li>Provide text alternatives for non-text content</li>
                    <li>Ensure keyboard navigability for all interactive elements</li>
                    <li>Design with screen readers and assistive technologies in mind</li>
                    <li>Support text resizing up to 200% without loss of content</li>
                    <li>Maintain proper heading hierarchy (H1 → H2 → H3)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Do's</CardTitle>
              <CardDescription>Accessibility best practices to follow</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ensure sufficient color contrast for all text and UI elements</li>
                <li>Use semantic HTML elements (button, nav, header, etc.)</li>
                <li>Provide clear focus indicators for keyboard navigation</li>
                <li>Add alternative text for all meaningful images</li>
                <li>Use proper ARIA attributes when needed</li>
                <li>Test with keyboard-only navigation</li>
                <li>Include labels for all form elements</li>
                <li>Maintain a logical tab order</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Don'ts</CardTitle>
              <CardDescription>Accessibility pitfalls to avoid</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Don't rely solely on color to convey meaning</li>
                <li>Don't use text that's too small (minimum 16px for body text)</li>
                <li>Don't remove focus indicators for keyboard users</li>
                <li>Don't use vague link text like "click here" or "learn more"</li>
                <li>Don't create custom controls without proper accessibility</li>
                <li>Don't use flashing content that could trigger seizures</li>
                <li>Don't auto-play audio without user controls</li>
                <li>Don't target specific assistive technologies; aim for universal design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-muted p-6 rounded-lg mb-8">
          <H3 className="mb-3">Testing Recommendations</H3>
          <P className="mb-4">
            To ensure accessibility, test interfaces with these approaches:
          </P>
          <ul className="list-disc pl-5 space-y-2">
            <li>Automated testing with tools like Axe, Wave, or Lighthouse</li>
            <li>Keyboard-only navigation testing</li>
            <li>Screen reader testing (NVDA, VoiceOver, JAWS)</li>
            <li>Color contrast analyzer tools</li>
            <li>Testing with real users who have disabilities when possible</li>
          </ul>
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link href="/design/components" className="text-primary hover:underline inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Components
          </Link>
          <Link href="/design/loading" className="text-primary hover:underline inline-flex items-center">
            Loading
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </Container>
  );
} 