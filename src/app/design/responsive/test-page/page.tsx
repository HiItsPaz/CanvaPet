'use client';

import { ResponsiveDebugger } from '@/components/ui/responsive-debugger';
import { ResponsiveTestCard, ResponsiveContent } from '@/components/ui/responsive-test-card';

export default function ResponsiveTestPage() {
  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Responsive Testing</h1>
        <p className="text-muted-foreground">
          Resize your browser window to see how the components adapt to different screen sizes.
        </p>
      </div>

      {/* Grid Layout Test */}
      <ResponsiveTestCard title="Grid Layout Test">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="aspect-square bg-primary/10 rounded-lg flex items-center justify-center font-medium"
            >
              Item {i + 1}
            </div>
          ))}
        </div>
      </ResponsiveTestCard>

      {/* Content Adaptation Test */}
      <ResponsiveTestCard title="Content Adaptation">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This component shows different content based on the current breakpoint:
          </p>
          
          <div className="p-6 rounded-lg bg-secondary">
            <ResponsiveContent
              xs={<p className="text-lg font-semibold">Mobile View (xs)</p>}
              sm={<p className="text-lg font-semibold">Small Tablet View (sm)</p>}
              md={<p className="text-lg font-semibold">Tablet View (md)</p>}
              lg={<p className="text-lg font-semibold">Laptop View (lg)</p>}
              xl={<p className="text-lg font-semibold">Desktop View (xl)</p>}
              xxl={<p className="text-lg font-semibold">Large Screen View (2xl)</p>}
            />
          </div>
        </div>
      </ResponsiveTestCard>

      {/* Image Responsiveness Test */}
      <ResponsiveTestCard title="Image Responsiveness">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Basic Responsive Image</h3>
            <div className="rounded-lg overflow-hidden">
              <img 
                src="https://placekitten.com/800/600" 
                alt="Placeholder" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Aspect Ratio Maintained</h3>
            <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
              <img 
                src="https://placekitten.com/800/600" 
                alt="Placeholder" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </ResponsiveTestCard>

      {/* Layout Shift Test */}
      <ResponsiveTestCard title="Layout Shift Test">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 p-4 bg-primary/10 rounded-lg">
            <h3 className="font-medium mb-2">Sidebar</h3>
            <p className="text-sm text-muted-foreground">
              This sidebar appears at the top on mobile, and to the left on larger screens.
            </p>
          </div>
          
          <div className="md:w-2/3 p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-medium mb-2">Main Content</h3>
            <p className="text-sm text-muted-foreground">
              The main content takes the full width on mobile, and 2/3 of the space on larger screens.
            </p>
          </div>
        </div>
      </ResponsiveTestCard>

      {/* Responsive Form Layout */}
      <ResponsiveTestCard title="Form Layout Adaptation">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="John" />
            </div>
            
            <div className="p-4 border rounded-lg">
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="Doe" />
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input type="email" className="w-full p-2 border rounded" placeholder="john@example.com" />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button className="px-4 py-2 border rounded-lg">Cancel</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Submit</button>
          </div>
        </div>
      </ResponsiveTestCard>

      {/* Position the debugger in the bottom right */}
      <ResponsiveDebugger position="bottom-right" />
    </div>
  );
} 