"use client"

import { ComponentDocs, ComponentExample, APIReference, CodeBlock } from "@/components/ui/component-docs"
import { Container } from "@/components/ui/container"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export default function ContainerDocsPage() {
  return (
    <ComponentDocs
      title="Container"
      description="Responsive container component with customizable max-width at different breakpoints."
      componentName="Container"
      examples={
        <div className="space-y-8">
          <ComponentExample
            title="Basic Container"
            description="Container with default max-width settings."
          >
            <div className="bg-slate-100 p-0 rounded-lg">
              <Container className="bg-blue-50 p-4 border border-dashed border-blue-200 rounded">
                <p className="text-center">Default container with automatic responsive max-width</p>
              </Container>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Container Sizes"
            description="Different container sizes for different content types."
          >
            <div className="bg-slate-100 p-0 rounded-lg space-y-4">
              <Container size="xs" className="bg-blue-50 p-4 border border-dashed border-blue-200 rounded">
                <p className="text-center">Extra Small Container (xs)</p>
              </Container>
              
              <Container size="sm" className="bg-blue-100 p-4 border border-dashed border-blue-200 rounded">
                <p className="text-center">Small Container (sm)</p>
              </Container>
              
              <Container size="md" className="bg-blue-50 p-4 border border-dashed border-blue-200 rounded">
                <p className="text-center">Medium Container (md - default)</p>
              </Container>
              
              <Container size="lg" className="bg-blue-100 p-4 border border-dashed border-blue-200 rounded">
                <p className="text-center">Large Container (lg)</p>
              </Container>
              
              <Container size="xl" className="bg-blue-50 p-4 border border-dashed border-blue-200 rounded">
                <p className="text-center">Extra Large Container (xl)</p>
              </Container>
              
              <Container size="2xl" className="bg-blue-100 p-4 border border-dashed border-blue-200 rounded">
                <p className="text-center">2X Large Container (2xl)</p>
              </Container>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Responsive Container Sizes"
            description="Container that changes size at different breakpoints."
          >
            <div className="bg-slate-100 p-0 rounded-lg">
              <Container 
                size={{ 
                  default: "xs", 
                  sm: "sm", 
                  md: "md", 
                  lg: "lg", 
                  xl: "xl", 
                  "2xl": "2xl" 
                }} 
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border border-dashed border-blue-200 rounded"
              >
                <p className="text-center">This container grows at each breakpoint</p>
                <p className="text-center text-sm text-slate-500 mt-2">
                  xs → sm → md → lg → xl → 2xl
                </p>
              </Container>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Container Alignment"
            description="Control container alignment with centered prop."
          >
            <div className="bg-slate-100 p-0 rounded-lg space-y-4">
              <Container 
                size="sm" 
                centered={false} 
                className="bg-blue-50 p-4 border border-dashed border-blue-200 rounded"
              >
                <p>Left aligned container (centered: false)</p>
              </Container>
              
              <Container 
                size="sm" 
                centered={true} 
                className="bg-blue-100 p-4 border border-dashed border-blue-200 rounded"
              >
                <p>Center aligned container (centered: true)</p>
              </Container>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Container with Custom Padding"
            description="Control container padding at different breakpoints."
          >
            <div className="bg-slate-100 p-0 rounded-lg">
              <Container 
                size="md" 
                padding="sm" 
                className="bg-blue-50 border border-dashed border-blue-200 rounded"
              >
                <p className="text-center p-4">Container with small padding</p>
              </Container>
              
              <div className="mt-4">
                <Container 
                  size="md" 
                  padding="lg" 
                  className="bg-blue-100 border border-dashed border-blue-200 rounded"
                >
                  <p className="text-center p-4">Container with large padding</p>
                </Container>
              </div>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Full Width and Fluid Containers"
            description="Containers that take 100% width with different behaviors."
          >
            <div className="bg-slate-100 p-0 rounded-lg space-y-4">
              <Container 
                size="full" 
                className="bg-blue-50 p-4 border border-dashed border-blue-200 rounded"
              >
                <p className="text-center">Full width container (no horizontal padding)</p>
              </Container>
              
              <Container 
                size="fluid" 
                className="bg-blue-100 p-4 border border-dashed border-blue-200 rounded"
              >
                <p className="text-center">Fluid container (with horizontal padding)</p>
              </Container>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Container with Content"
            description="Practical example of container with content."
          >
            <div className="bg-slate-100 p-0 rounded-lg">
              <Container size="md" className="py-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Responsive Container Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      This card is inside a responsive container that maintains a readable
                      width across different device sizes. Containers help maintain consistent
                      margins and content width throughout your application.
                    </p>
                  </CardContent>
                </Card>
              </Container>
            </div>
          </ComponentExample>
        </div>
      }
      apiReference={
        <>
          <APIReference
            componentName="Container"
            propsTable={[
              {
                prop: "size",
                type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fluid' | ResponsiveSize",
                default: "'lg'",
                description: "Container size or responsive object with different sizes at different breakpoints."
              },
              {
                prop: "centered",
                type: "boolean",
                default: "true",
                description: "Whether to center the container horizontally."
              },
              {
                prop: "padding",
                type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'",
                default: "'md'",
                description: "Horizontal padding size."
              },
              {
                prop: "as",
                type: "React.ElementType",
                default: "'div'",
                description: "Element to render as."
              }
            ]}
          />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Basic Container Example</h3>
            <CodeBlock
              code={`
// Default container (large size, centered)
<Container>
  <YourContent />
</Container>

// Small container, left-aligned
<Container size="sm" centered={false}>
  <YourContent />
</Container>
              `}
            />

            <h3 className="text-lg font-semibold">Responsive Container Example</h3>
            <CodeBlock
              code={`
// Container with different sizes at different breakpoints
<Container
  size={{
    default: "xs",   // Extra small on mobile
    sm: "sm",        // Small on small tablets
    md: "md",        // Medium on tablets
    lg: "lg",        // Large on desktops
    xl: "xl"         // Extra large on large screens
  }}
  padding="sm"
>
  <YourContent />
</Container>
              `}
            />

            <h3 className="text-lg font-semibold">Practical Layout Example</h3>
            <CodeBlock
              code={`
// Layout example with responsive container
<header className="bg-primary text-white">
  <Container>
    <Navbar />
  </Container>
</header>

<main>
  <Container size="lg">
    <h1>Page Title</h1>
    <p>Introduction text...</p>
    
    {/* Narrower container for better readability of article content */}
    <Container size="md">
      <article>
        <p>Article content with better reading width...</p>
      </article>
    </Container>
    
    {/* Wider container for grid of items */}
    <Container size="xl">
      <h2>Related Items</h2>
      <Grid columns={{ default: 1, sm: 2, md: 3, lg: 4 }}>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
        <Card>Item 4</Card>
      </Grid>
    </Container>
  </Container>
</main>

<footer className="bg-gray-100">
  <Container>
    <FooterContent />
  </Container>
</footer>
              `}
            />
          </div>
        </>
      }
    />
  )
} 