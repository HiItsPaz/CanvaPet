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
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'CanvaPet Component Showcase',
  description: 'Showcase of CanvaPet UI components with our custom color theme',
};

export default function ComponentShowcasePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">UI Components</h1>
        <p className="text-muted-foreground mb-8">
          Showcase of CanvaPet UI components using our custom color theme.
        </p>
        
        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Buttons</h2>
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Showcasing different button variants using our custom color theme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Button Sizes</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Badges</h2>
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>
                Different badge styles using our theme colors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Card</CardTitle>
                <CardDescription>
                  A card with default styling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards provide a flexible container for grouping related content and actions.</p>
              </CardContent>
              <CardFooter>
                <Button variant="default">Primary Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-secondary text-secondary-foreground">
              <CardHeader>
                <CardTitle>Secondary Card</CardTitle>
                <CardDescription className="text-secondary-foreground/80">
                  A card with secondary background.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card uses the secondary (coral) color as its background.</p>
              </CardContent>
              <CardFooter>
                <Button variant="default">Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-accent text-accent-foreground">
              <CardHeader>
                <CardTitle>Accent Card</CardTitle>
                <CardDescription className="text-accent-foreground/80">
                  A card with accent background.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card uses the accent (yellow) color as its background.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-primary border-2">
              <CardHeader>
                <CardTitle>Primary Border Card</CardTitle>
                <CardDescription>
                  A card with primary border.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card uses the primary (blue) color for its border.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        {/* Color Combinations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Color Combinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary p-6 rounded-lg text-primary-foreground">
              <h3 className="font-semibold mb-2">Primary Background</h3>
              <p className="mb-4">Text on primary background.</p>
              <Button variant="secondary">Secondary Button</Button>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg text-secondary-foreground">
              <h3 className="font-semibold mb-2">Secondary Background</h3>
              <p className="mb-4">Text on secondary background.</p>
              <Button variant="accent">Accent Button</Button>
            </div>
            
            <div className="bg-accent p-6 rounded-lg text-accent-foreground">
              <h3 className="font-semibold mb-2">Accent Background</h3>
              <p className="mb-4">Text on accent background.</p>
              <Button variant="default">Primary Button</Button>
            </div>
          </div>
        </section>
        
        {/* Theme Toggle Section */}
        <section className="mt-16 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-bold mb-4">Dark Mode Support</h2>
          <p className="mb-4">
            All components automatically adjust for dark mode. Use the theme toggle in the top navigation to see how components appear in dark mode.
          </p>
        </section>
      </div>
    </div>
  );
} 