"use client"

import { ComponentDocs, ComponentExample, APIReference, CodeBlock } from "@/components/ui/component-docs"
import { Hidden, Visible, Spacer } from "@/components/ui/responsive-utils"
import { Card } from "@/components/ui/card"

export default function ResponsiveUtilsDocsPage() {
  return (
    <ComponentDocs
      title="Responsive Utilities"
      description="Utility components for managing responsive behavior across different screen sizes."
      componentName="Responsive Utils"
      examples={
        <div className="space-y-8">
          <ComponentExample
            title="Hidden Component"
            description="Hide content at specific breakpoints."
          >
            <div className="bg-slate-100 p-4 rounded-lg space-y-4">
              <p className="text-sm text-slate-500 mb-2">Resize your browser to see how elements appear and disappear at different breakpoints:</p>
              
              <Hidden above="md" className="bg-blue-100 p-4 rounded">
                <p className="font-medium">Only visible on mobile and tablet (below md)</p>
                <p className="text-sm text-slate-500">This content is hidden on md screens and above</p>
              </Hidden>
              
              <Hidden below="md" className="bg-green-100 p-4 rounded">
                <p className="font-medium">Only visible on desktop (md and above)</p>
                <p className="text-sm text-slate-500">This content is hidden on screens smaller than md</p>
              </Hidden>
              
              <Hidden at="md" className="bg-purple-100 p-4 rounded">
                <p className="font-medium">Hidden only on md screens</p>
                <p className="text-sm text-slate-500">This content is hidden specifically on md-sized screens</p>
              </Hidden>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Visible Component"
            description="Show content only at specific breakpoints."
          >
            <div className="bg-slate-100 p-4 rounded-lg space-y-4">
              <Visible below="md" className="bg-red-100 p-4 rounded">
                <p className="font-medium">Mobile and tablet version</p>
                <p className="text-sm text-slate-500">Only visible below md breakpoint</p>
              </Visible>
              
              <Visible above="md" className="bg-yellow-100 p-4 rounded">
                <p className="font-medium">Desktop version</p>
                <p className="text-sm text-slate-500">Only visible at md breakpoint and above</p>
              </Visible>
              
              <Visible at="md" className="bg-emerald-100 p-4 rounded">
                <p className="font-medium">Tablet-specific content</p>
                <p className="text-sm text-slate-500">Only visible exactly at md breakpoint</p>
              </Visible>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Spacer Component"
            description="Add responsive spacing between elements."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="flex flex-col">
                <div className="bg-blue-100 p-4 rounded">First element</div>
                
                <Spacer 
                  size={{ 
                    default: 2,
                    md: 4,
                    lg: 8
                  }} 
                />
                
                <div className="bg-blue-100 p-4 rounded">Second element (spacing increases on larger screens)</div>
                
                <Spacer size={4} />
                
                <div className="bg-blue-100 p-4 rounded">Third element (fixed spacing)</div>
              </div>
              
              <div className="flex items-center mt-8">
                <div className="bg-green-100 p-4 rounded">Horizontal</div>
                
                <Spacer 
                  direction="horizontal" 
                  size={{ 
                    default: 2,
                    md: 4,
                    lg: 8
                  }} 
                />
                
                <div className="bg-green-100 p-4 rounded">Spacing</div>
                
                <Spacer direction="horizontal" size={4} />
                
                <div className="bg-green-100 p-4 rounded">Example</div>
              </div>
            </div>
          </ComponentExample>

          <ComponentExample
            title="Responsive Content Adaptation"
            description="Different components for different screen sizes."
          >
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-4">Resize your browser to see different content layouts:</p>
              
              <Visible below="md">
                <div className="bg-blue-100 p-4 rounded">
                  <h3 className="font-medium text-lg mb-2">Mobile Layout</h3>
                  <p>Simplified single-column view optimized for small screens.</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="bg-white p-2 rounded">Option 1</div>
                    <div className="bg-white p-2 rounded">Option 2</div>
                    <div className="bg-white p-2 rounded">Option 3</div>
                  </div>
                </div>
              </Visible>
              
              <Visible at={["md", "lg"]}>
                <div className="bg-green-100 p-4 rounded">
                  <h3 className="font-medium text-lg mb-2">Tablet Layout</h3>
                  <p>Two-column view with moderate details.</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-white p-2 rounded">Option 1</div>
                    <div className="bg-white p-2 rounded">Option 2</div>
                    <div className="bg-white p-2 rounded">Option 3</div>
                    <div className="bg-white p-2 rounded">Option 4</div>
                  </div>
                </div>
              </Visible>
              
              <Visible above="lg">
                <div className="bg-purple-100 p-4 rounded">
                  <h3 className="font-medium text-lg mb-2">Desktop Layout</h3>
                  <p>Full featured multi-column display with advanced options.</p>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="bg-white p-2 rounded">Option 1</div>
                    <div className="bg-white p-2 rounded">Option 2</div>
                    <div className="bg-white p-2 rounded">Option 3</div>
                    <div className="bg-white p-2 rounded">Option 4</div>
                    <div className="bg-white p-2 rounded">Option 5</div>
                    <div className="bg-white p-2 rounded">Option 6</div>
                    <div className="bg-white p-2 rounded">Option 7</div>
                    <div className="bg-white p-2 rounded">Option 8</div>
                  </div>
                </div>
              </Visible>
            </div>
          </ComponentExample>
        </div>
      }
      apiReference={
        <>
          <APIReference
            componentName="Hidden"
            propsTable={[
              {
                prop: "below",
                type: "'always' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
                description: "Hide at and below these breakpoints (inclusive)."
              },
              {
                prop: "above",
                type: "'always' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
                description: "Hide at and above these breakpoints (inclusive)."
              },
              {
                prop: "at",
                type: "'always' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | Array<...>",
                description: "Hide only at these exact breakpoints."
              },
              {
                prop: "as",
                type: "React.ElementType",
                default: "'div'",
                description: "Element to render as."
              }
            ]}
          />

          <APIReference
            componentName="Visible"
            propsTable={[
              {
                prop: "below",
                type: "'always' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
                description: "Show only at and below these breakpoints (inclusive)."
              },
              {
                prop: "above",
                type: "'always' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
                description: "Show only at and above these breakpoints (inclusive)."
              },
              {
                prop: "at",
                type: "'always' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | Array<...>",
                description: "Show only at these exact breakpoints."
              },
              {
                prop: "as",
                type: "React.ElementType",
                default: "'div'",
                description: "Element to render as."
              }
            ]}
          />

          <APIReference
            componentName="Spacer"
            propsTable={[
              {
                prop: "size",
                type: "number | { default?: number, sm?: number, md?: number, lg?: number, xl?: number, '2xl'?: number }",
                default: "4",
                description: "Spacing size or responsive object with different sizes at different breakpoints."
              },
              {
                prop: "direction",
                type: "'vertical' | 'horizontal'",
                default: "'vertical'",
                description: "The direction of the spacer."
              }
            ]}
          />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Responsive Visibility Example</h3>
            <CodeBlock
              code={`
// Only show on mobile and tablets
<Hidden above="md">
  <p>This is only visible on smaller screens</p>
  <MobileNavigation />
</Hidden>

// Only show on desktop
<Hidden below="md">
  <p>This is only visible on larger screens</p>
  <DesktopNavigation />
</Hidden>

// Alternative approach with Visible
<Visible below="md">
  <MobileNavigation />
</Visible>

<Visible above="md">
  <DesktopNavigation />
</Visible>
              `}
            />

            <h3 className="text-lg font-semibold">Responsive Spacing Example</h3>
            <CodeBlock
              code={`
// Vertical spacing that increases on larger screens
<div className="flex flex-col">
  <Card>First card</Card>
  
  <Spacer 
    size={{ 
      default: 2,  // 0.5rem on mobile
      md: 4,       // 1rem on tablets
      lg: 8        // 2rem on desktop
    }} 
  />
  
  <Card>Second card</Card>
</div>

// Horizontal spacing
<div className="flex items-center">
  <Button>Previous</Button>
  <Spacer direction="horizontal" size={4} />
  <Button>Next</Button>
</div>
              `}
            />
          </div>
        </>
      }
    />
  )
} 