"use client";

import { 
  H1, 
  H2, 
  H3,
  H4,
  P,
  Lead,
  Large,
  Small,
  Subtle,
} from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from 'next/link';

export default function ClientTypographyContent() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Responsive Scaling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <P>
              All typography components automatically scale at breakpoints:
            </P>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">xs/default</code>: Base size for mobile
              </li>
              <li>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">sm</code>: Slightly larger for small tablets
              </li>
              <li>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">md</code>: Medium size for tablets and small laptops
              </li>
              <li>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">lg</code>: Large size for desktops
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <P>Our typography uses:</P>
            <ul className="list-disc ml-6 space-y-2">
              <li>Tailwind's responsive utilities</li>
              <li>Base size set at 16px (browser default)</li>
              <li>Relative units (rem) for scaling</li>
              <li>Consistent type scale ratios</li>
              <li>Fluid scaling at breakpoints</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <H2 className="mt-12 mb-4">Type Scale</H2>
        <P>
          Our type scale provides a harmonious progression of sizes that work well together
          across all screen sizes.
        </P>
        
        <div className="mt-8 space-y-6">
          <div className="border p-6 rounded-lg bg-blue-50">
            <div className="flex flex-col gap-1">
              <small className="text-gray-500 mb-2">Resize your browser to see how typography scales</small>
              <H1>Heading 1</H1>
              <code className="text-sm text-gray-500">3xl → 4xl → 5xl → 6xl</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg">
            <div className="flex flex-col gap-1">
              <H2>Heading 2</H2>
              <code className="text-sm text-gray-500">2xl → 3xl → 4xl</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg bg-blue-50">
            <div className="flex flex-col gap-1">
              <H3>Heading 3</H3>
              <code className="text-sm text-gray-500">xl → 2xl</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg">
            <div className="flex flex-col gap-1">
              <H4>Heading 4</H4>
              <code className="text-sm text-gray-500">lg → xl</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg bg-blue-50">
            <div className="flex flex-col gap-1">
              <P>Paragraph Text</P>
              <code className="text-sm text-gray-500">base → lg</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg">
            <div className="flex flex-col gap-1">
              <Lead>Lead Paragraph</Lead>
              <code className="text-sm text-gray-500">xl → 2xl</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg bg-blue-50">
            <div className="flex flex-col gap-1">
              <Large>Large Text</Large>
              <code className="text-sm text-gray-500">lg → xl</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg">
            <div className="flex flex-col gap-1">
              <Small>Small Text</Small>
              <code className="text-sm text-gray-500">sm → base</code>
            </div>
          </div>

          <div className="border p-6 rounded-lg bg-blue-50">
            <div className="flex flex-col gap-1">
              <Subtle>Subtle Text</Subtle>
              <code className="text-sm text-gray-500">sm → base (muted color)</code>
            </div>
          </div>
        </div>
      </div>

      <div>
        <H2 className="mt-12 mb-4">Typography Components</H2>
        <P>
          Use our type components to maintain consistent typography throughout your application.
          These components automatically apply the correct responsive scaling.
        </P>

        <div className="mt-6 overflow-hidden border rounded-lg">
          <Tabs defaultValue="preview">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-6">
              <div className="space-y-6">
                <H1>Heading 1</H1>
                <H2>Heading 2</H2>
                <H3>Heading 3</H3>
                <H4>Heading 4</H4>
                <Lead>This is a lead paragraph, used for introductions.</Lead>
                <P>This is a regular paragraph with standard text styling. It automatically scales between breakpoints for optimal readability on different devices.</P>
                <Large>This is large text, used for emphasis.</Large>
                <Small>This is small text, used for less important information.</Small>
                <Subtle>This is subtle text, used for secondary information.</Subtle>
              </div>
            </TabsContent>
            <TabsContent value="code" className="p-0">
              <pre className="p-6 text-sm overflow-auto">
{`import { H1, H2, H3, H4, P, Lead, Large, Small, Subtle } from "@/components/ui/typography";

function MyComponent() {
  return (
    <>
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>
      <Lead>This is a lead paragraph, used for introductions.</Lead>
      <P>This is a regular paragraph with standard text styling.</P>
      <Large>This is large text, used for emphasis.</Large>
      <Small>This is small text, used for less important information.</Small>
      <Subtle>This is subtle text, used for secondary information.</Subtle>
    </>
  );
}`}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div>
        <H2 className="mt-12 mb-4">Responsive Behavior</H2>
        <P>
          All typography components are responsive by default. Here's an example of how they adapt
          at different screen sizes:
        </P>

        <table className="w-full mt-6 border-collapse overflow-hidden rounded-lg border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Component</th>
              <th className="p-3 text-left">Mobile (default)</th>
              <th className="p-3 text-left">Tablet (sm/md)</th>
              <th className="p-3 text-left">Desktop (lg+)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3 font-medium">H1</td>
              <td className="p-3">text-3xl</td>
              <td className="p-3">text-4xl / text-5xl</td>
              <td className="p-3">text-6xl</td>
            </tr>
            <tr className="border-t bg-gray-50">
              <td className="p-3 font-medium">H2</td>
              <td className="p-3">text-2xl</td>
              <td className="p-3">text-3xl / text-4xl</td>
              <td className="p-3">text-4xl</td>
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium">H3</td>
              <td className="p-3">text-xl</td>
              <td className="p-3">text-2xl</td>
              <td className="p-3">text-2xl</td>
            </tr>
            <tr className="border-t bg-gray-50">
              <td className="p-3 font-medium">H4</td>
              <td className="p-3">text-lg</td>
              <td className="p-3">text-xl</td>
              <td className="p-3">text-xl</td>
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium">P</td>
              <td className="p-3">text-base</td>
              <td className="p-3">text-lg</td>
              <td className="p-3">text-lg</td>
            </tr>
            <tr className="border-t bg-gray-50">
              <td className="p-3 font-medium">Lead</td>
              <td className="p-3">text-xl</td>
              <td className="p-3">text-2xl</td>
              <td className="p-3">text-2xl</td>
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium">Small</td>
              <td className="p-3">text-sm</td>
              <td className="p-3">text-base</td>
              <td className="p-3">text-base</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <H2 className="mt-12 mb-4">Best Practices</H2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc ml-6 space-y-2">
                <li>Use typography components for consistent scaling</li>
                <li>Maintain a clear hierarchy with appropriate heading levels</li>
                <li>Use responsive containers with appropriate max-width</li>
                <li>Adjust line heights for better readability</li>
                <li>Test typography on multiple device sizes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Don't</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc ml-6 space-y-2">
                <li>Use absolute units (px) for font sizes</li>
                <li>Skip heading levels (e.g., H1 to H3)</li>
                <li>Create overly long lines of text ({'>'}80 characters)</li>
                <li>Use extremely small font sizes on mobile</li>
                <li>Manually override the responsive behavior</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
        <Link href="/design/colors" className="text-primary hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Colors
        </Link>
        <Link href="/design/components" className="text-primary hover:underline inline-flex items-center">
          Components
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </>
  );
} 