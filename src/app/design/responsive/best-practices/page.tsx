import { ResponsiveDebugger } from "@/components/ui/responsive-debugger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Responsive Design Best Practices | CanvaPet Design",
  description: "Guidelines and best practices for responsive design in the CanvaPet application"
}

export default function ResponsiveBestPracticesPage() {
  return (
    <div className="container mx-auto py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Responsive Design Best Practices</h1>
      
      <div className="mb-12">
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6">
          <ResponsiveDebugger />
        </div>
        <p className="text-muted-foreground mb-4">
          The CanvaPet design system is built with responsiveness at its core. This guide outlines best practices 
          for developing responsive components that adapt gracefully across all device sizes.
        </p>
      </div>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Core Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mobile-First Approach</CardTitle>
                <CardDescription>Design for mobile screens first, then progressively enhance for larger screens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Start by designing and building for the smallest target screen. Then add more features, 
                    content, and sophistication as the screen size increases.
                  </p>
                  <div className="bg-secondary/10 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
                      {`<div className="flex flex-col sm:flex-row">\n  <div className="w-full sm:w-1/2">...</div>\n  <div className="w-full sm:w-1/2">...</div>\n</div>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fluid Layouts</CardTitle>
                <CardDescription>Use relative units rather than fixed pixels for layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Use relative units like percentages, rems, and ems instead of pixels. 
                    This allows content to adapt to its container and viewport size.
                  </p>
                  <div className="bg-secondary/10 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
                      {`/* Avoid fixed widths */\nwidth: 400px; \n\n/* Prefer relative units */\nwidth: 100%;\nmax-width: 25rem;`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tailwind Breakpoints</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Breakpoint</th>
                  <th className="text-left p-2">CSS</th>
                  <th className="text-left p-2">Width</th>
                  <th className="text-left p-2">Example Devices</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2"><Badge>xs/default</Badge></td>
                  <td className="p-2"><code>@media (min-width: 0px)</code></td>
                  <td className="p-2">0px+</td>
                  <td className="p-2">Small mobile phones</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><Badge>sm</Badge></td>
                  <td className="p-2"><code>@media (min-width: 640px)</code></td>
                  <td className="p-2">640px+</td>
                  <td className="p-2">Large mobile phones</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><Badge>md</Badge></td>
                  <td className="p-2"><code>@media (min-width: 768px)</code></td>
                  <td className="p-2">768px+</td>
                  <td className="p-2">Tablets, small laptops</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><Badge>lg</Badge></td>
                  <td className="p-2"><code>@media (min-width: 1024px)</code></td>
                  <td className="p-2">1024px+</td>
                  <td className="p-2">Laptops, desktops</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><Badge>xl</Badge></td>
                  <td className="p-2"><code>@media (min-width: 1280px)</code></td>
                  <td className="p-2">1280px+</td>
                  <td className="p-2">Large desktops</td>
                </tr>
                <tr>
                  <td className="p-2"><Badge>2xl</Badge></td>
                  <td className="p-2"><code>@media (min-width: 1536px)</code></td>
                  <td className="p-2">1536px+</td>
                  <td className="p-2">Extra large displays</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-secondary/10 p-4 rounded">
            <p className="text-sm mb-2 font-medium">Using Tailwind Breakpoints:</p>
            <pre className="text-xs whitespace-pre-wrap">
{`// Base styles apply to all screen sizes
<div className="p-2 text-sm flex flex-col">
  
  // At "sm" breakpoint (640px+) and above
  <div className="hidden sm:block">Only visible on tablets and up</div>
  
  // At "md" breakpoint (768px+) and above
  <div className="p-2 md:p-4 lg:p-6">Padding increases with screen size</div>
  
  // Change layout at different breakpoints
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    Responsive grid
  </div>
</div>`}
            </pre>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Implementation Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progressive Enhancement</CardTitle>
                <CardDescription>Add features as screen size increases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Start with a minimal but functional interface for small screens, then add more features
                    and content as screen real estate increases.
                  </p>
                  <div className="bg-secondary/10 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
{`<div>
  {/* Core content - always visible */}
  <p>Essential information</p>
  
  {/* Enhanced content - only on larger screens */}
  <p className="hidden md:block">
    Additional details
  </p>
  
  {/* Extra features - only on desktop */}
  <div className="hidden lg:flex">
    Advanced options
  </div>
</div>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Responsive Typography</CardTitle>
                <CardDescription>Scale text based on screen size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Text sizes should scale proportionally across screen sizes. Use Tailwind's
                    text size utilities with breakpoints.
                  </p>
                  <div className="bg-secondary/10 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
{`// Headings that scale with screen size
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

// Body text
<p className="text-sm md:text-base">
  This paragraph will be small on mobile but normal sized on tablets and up.
</p>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Touch-Friendly Interfaces</CardTitle>
                <CardDescription>Design for fingers, not just mouse pointers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Interactive elements should be sized appropriately for touch (minimum 44x44px)
                    and have sufficient spacing.
                  </p>
                  <div className="bg-secondary/10 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
{`// Buttons sized for touch
<button className="h-11 px-4 py-2">
  Touch-friendly Button
</button>

// Adequate spacing between interactive elements
<div className="space-y-4 md:space-y-2">
  <button>Button 1</button>
  <button>Button 2</button>
</div>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Responsive Containers</CardTitle>
                <CardDescription>Use container queries for component-specific responsiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Starting with Tailwind v3.2, we can use @container for component-level
                    responsiveness, independent of viewport size.
                  </p>
                  <div className="bg-secondary/10 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
{`<div className="@container">
  <div className="@md:grid @md:grid-cols-2 @lg:grid-cols-3">
    {/* This grid responds to its container, not the viewport */}
  </div>
</div>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Testing Tools</h2>
          <div className="space-y-4">
            <p className="text-sm">
              The CanvaPet design system provides tools to help test responsiveness:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>ResponsiveDebugger component</strong> - Shows the current breakpoint
                in real-time. Add to your page during development.
              </li>
              <li>
                <strong>ResponsiveShowcase</strong> - Interactive demo page that simulates 
                different viewport sizes.
              </li>
              <li>
                <strong>Browser DevTools</strong> - Use browser responsive design mode to test 
                different device sizes.
              </li>
            </ul>
            <div className="bg-secondary/10 p-3 rounded">
              <pre className="text-xs whitespace-pre-wrap">
{`// Add to any page for development
import { ResponsiveDebugger } from "@/components/ui/responsive-debugger"

// In your component
<div className="my-page">
  {process.env.NODE_ENV === 'development' && (
    <ResponsiveDebugger fixed />
  )}
  
  {/* Rest of your content */}
</div>`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 