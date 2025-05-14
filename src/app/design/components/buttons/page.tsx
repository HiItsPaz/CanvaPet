"use client"

import { ComponentDocs, ComponentExample, APIReference, CodeBlock } from "@/components/ui/component-docs"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { 
  Plus, 
  Download, 
  ArrowRight, 
  Trash, 
  ChevronRight 
} from "lucide-react"

export default function ButtonsDocPage() {
  return (
    <ComponentDocs
      title="Button"
      description="Interactive button component with different variants, sizes, and states."
      componentName="Button"
      examples={
        <div className="space-y-8">
          <ComponentExample
            title="Button Variants"
            description="Different button styles to represent different actions and hierarchy."
          >
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button variant="accent">Accent</Button>
            </div>
          </ComponentExample>
          
          <ComponentExample
            title="Button Sizes"
            description="Different button sizes to accommodate various UI requirements."
          >
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add item">
                <Icon icon={Plus} />
              </Button>
            </div>
          </ComponentExample>
          
          <ComponentExample
            title="Loading State"
            description="Buttons can show a loading indicator when an action is being processed."
          >
            <div className="flex flex-wrap gap-4">
              <Button isLoading>Loading</Button>
              <Button isLoading loadingText="Saving...">Save</Button>
              <Button variant="outline" isLoading>Processing</Button>
            </div>
          </ComponentExample>
          
          <ComponentExample
            title="Icon Buttons"
            description="Buttons can include icons to provide visual cues."
          >
            <div className="flex flex-wrap gap-4">
              <Button startIcon={<Icon icon={Download} size="sm" />}>
                Download
              </Button>
              <Button endIcon={<Icon icon={ArrowRight} size="sm" />} variant="secondary">
                Continue
              </Button>
              <Button startIcon={<Icon icon={Trash} size="sm" />} variant="destructive">
                Delete
              </Button>
              <Button variant="ghost" startIcon={<Icon icon={ChevronRight} size="sm" />}>
                View Details
              </Button>
            </div>
          </ComponentExample>
          
          <ComponentExample
            title="Disabled State"
            description="Buttons can be disabled to prevent user interaction."
          >
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button disabled variant="secondary">Disabled</Button>
              <Button disabled variant="destructive">Disabled</Button>
              <Button disabled variant="outline">Disabled</Button>
            </div>
          </ComponentExample>
        </div>
      }
      usage={
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
            <CodeBlock
              language="tsx"
              code={`import { Button } from "@/components/ui/button"

export default function MyComponent() {
  return (
    <Button>Click me</Button>
  )
}`}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">With Icons</h3>
            <CodeBlock
              language="tsx"
              code={`import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Download } from "lucide-react"

export default function MyComponent() {
  return (
    <Button startIcon={<Icon icon={Download} size="sm" />}>
      Download
    </Button>
  )
}`}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Loading State</h3>
            <CodeBlock
              language="tsx"
              code={`import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleClick = () => {
    setIsLoading(true)
    // Perform async operation
    setTimeout(() => setIsLoading(false), 2000)
  }
  
  return (
    <Button 
      isLoading={isLoading} 
      loadingText="Saving..."
      onClick={handleClick}
    >
      Save
    </Button>
  )
}`}
            />
          </div>
        </div>
      }
      apiReference={
        <APIReference
          componentName="Button"
          propsTable={[
            {
              prop: "asChild",
              type: "boolean",
              default: "false",
              description: "When true, the component will render its child directly, transferring all props to it."
            },
            {
              prop: "variant",
              type: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'accent'",
              default: "'default'",
              description: "The visual style of the button."
            },
            {
              prop: "size",
              type: "'default' | 'sm' | 'lg' | 'icon'",
              default: "'default'",
              description: "The size of the button."
            },
            {
              prop: "startIcon",
              type: "React.ReactNode",
              description: "Icon to display at the start of the button."
            },
            {
              prop: "endIcon",
              type: "React.ReactNode",
              description: "Icon to display at the end of the button."
            },
            {
              prop: "isLoading",
              type: "boolean",
              default: "false",
              description: "Whether the button is in a loading state."
            },
            {
              prop: "loadingText",
              type: "string",
              description: "Text to display when the button is loading."
            },
            {
              prop: "startIconProps",
              type: "Partial<IconProps>",
              description: "Props to pass to the start icon when using Icon component."
            },
            {
              prop: "endIconProps",
              type: "Partial<IconProps>",
              description: "Props to pass to the end icon when using Icon component."
            }
          ]}
        />
      }
      accessibility={
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Keyboard Interactions</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs border-b">
                    <th className="font-medium p-3">Key</th>
                    <th className="font-medium p-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="font-mono text-xs p-3 align-top">Enter / Space</td>
                    <td className="text-xs p-3 align-top">Activates the button.</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs p-3 align-top">Tab</td>
                    <td className="text-xs p-3 align-top">Moves focus to the next focusable element.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">ARIA Attributes</h3>
            <p className="text-sm mb-3">
              The Button component uses native HTML button elements, which have built-in accessibility features:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Uses native <code className="font-mono bg-muted px-1 rounded">button</code> element with proper semantics</li>
              <li>Disabled state is properly communicated to assistive technology</li>
              <li>Loading state adds a loading indicator with appropriate ARIA attributes</li>
              <li>Icon-only buttons include an <code className="font-mono bg-muted px-1 rounded">aria-label</code> to describe their action</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Focus Management</h3>
            <p className="text-sm">
              Buttons receive a visible focus ring when focused via keyboard for better accessibility. 
              This focus indicator helps users understand which element is currently active.
            </p>
          </div>
        </div>
      }
    />
  )
} 