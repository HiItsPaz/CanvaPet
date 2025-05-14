"use client"

import { ComponentDocs, ComponentExample, APIReference, CodeBlock } from "@/components/ui/component-docs"
import { Sidebar, SidebarSection, SidebarItem } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { 
  Home, 
  Settings, 
  Users, 
  FileText, 
  HelpCircle
} from "lucide-react"

export default function LayoutDocsPage() {
  return (
    <ComponentDocs
      title="Layout Components"
      description="Structural components for building consistent page layouts and navigation."
      componentName="Sidebar"
      examples={
        <div className="space-y-8">
          <ComponentExample
            title="Sidebar Basic Example"
            description="A vertical navigation sidebar with sections and items."
          >
            <div className="border rounded-md p-4 bg-background">
              <Sidebar className="h-[400px]" width="md">
                <SidebarSection title="Main">
                  <SidebarItem 
                    icon={<Icon icon={Home} size="sm" />} 
                    href="#"
                    active
                  >
                    Dashboard
                  </SidebarItem>
                  <SidebarItem 
                    icon={<Icon icon={Users} size="sm" />} 
                    href="#"
                  >
                    Users
                  </SidebarItem>
                  <SidebarItem 
                    icon={<Icon icon={FileText} size="sm" />} 
                    href="#"
                  >
                    Documents
                  </SidebarItem>
                </SidebarSection>
                
                <SidebarSection title="Settings">
                  <SidebarItem 
                    icon={<Icon icon={Settings} size="sm" />} 
                    href="#"
                  >
                    Preferences
                  </SidebarItem>
                  <SidebarItem 
                    icon={<Icon icon={HelpCircle} size="sm" />} 
                    href="#"
                  >
                    Help & Support
                  </SidebarItem>
                </SidebarSection>
              </Sidebar>
            </div>
          </ComponentExample>
          
          <ComponentExample
            title="Collapsible Sidebar"
            description="A sidebar that can be collapsed to save space."
          >
            <div className="border rounded-md p-4 bg-background">
              <Sidebar className="h-[400px]" width="md" collapsible>
                <SidebarSection title="Main">
                  <SidebarItem 
                    icon={<Icon icon={Home} size="sm" />} 
                    href="#"
                    active
                  >
                    Dashboard
                  </SidebarItem>
                  <SidebarItem 
                    icon={<Icon icon={Users} size="sm" />} 
                    href="#"
                  >
                    Users
                  </SidebarItem>
                  <SidebarItem 
                    icon={<Icon icon={FileText} size="sm" />} 
                    href="#"
                  >
                    Documents
                  </SidebarItem>
                </SidebarSection>
                
                <SidebarSection title="Settings">
                  <SidebarItem 
                    icon={<Icon icon={Settings} size="sm" />} 
                    href="#"
                  >
                    Preferences
                  </SidebarItem>
                  <SidebarItem 
                    icon={<Icon icon={HelpCircle} size="sm" />} 
                    href="#"
                  >
                    Help & Support
                  </SidebarItem>
                </SidebarSection>
              </Sidebar>
            </div>
          </ComponentExample>
          
          <ComponentExample
            title="Sidebar Widths"
            description="Sidebars can be configured with different widths."
          >
            <div className="flex flex-wrap gap-4">
              <div className="border rounded-md p-4 bg-background">
                <Sidebar className="h-[300px]" width="sm">
                  <SidebarSection title="Small Width">
                    <SidebarItem 
                      icon={<Icon icon={Home} size="sm" />} 
                      href="#"
                      active
                    >
                      Dashboard
                    </SidebarItem>
                    <SidebarItem 
                      icon={<Icon icon={Users} size="sm" />} 
                      href="#"
                    >
                      Users
                    </SidebarItem>
                  </SidebarSection>
                </Sidebar>
              </div>
              
              <div className="border rounded-md p-4 bg-background">
                <Sidebar className="h-[300px]" width="md">
                  <SidebarSection title="Medium Width">
                    <SidebarItem 
                      icon={<Icon icon={Home} size="sm" />} 
                      href="#"
                      active
                    >
                      Dashboard
                    </SidebarItem>
                    <SidebarItem 
                      icon={<Icon icon={Users} size="sm" />} 
                      href="#"
                    >
                      Users
                    </SidebarItem>
                  </SidebarSection>
                </Sidebar>
              </div>
              
              <div className="border rounded-md p-4 bg-background">
                <Sidebar className="h-[300px]" width="lg">
                  <SidebarSection title="Large Width">
                    <SidebarItem 
                      icon={<Icon icon={Home} size="sm" />} 
                      href="#"
                      active
                    >
                      Dashboard
                    </SidebarItem>
                    <SidebarItem 
                      icon={<Icon icon={Users} size="sm" />} 
                      href="#"
                    >
                      Users
                    </SidebarItem>
                  </SidebarSection>
                </Sidebar>
              </div>
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
              code={`import { Sidebar, SidebarSection, SidebarItem } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { Home, Settings } from "lucide-react"

export default function MyLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="h-screen" width="md">
        <SidebarSection title="Main">
          <SidebarItem 
            icon={<Icon icon={Home} size="sm" />} 
            href="/dashboard"
            active={pathname === "/dashboard"}
          >
            Dashboard
          </SidebarItem>
          <SidebarItem 
            icon={<Icon icon={Settings} size="sm" />} 
            href="/settings"
            active={pathname === "/settings"}
          >
            Settings
          </SidebarItem>
        </SidebarSection>
      </Sidebar>
      
      <div className="flex-1">
        {/* Main content goes here */}
      </div>
    </div>
  )
}`}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Collapsible Sidebar</h3>
            <CodeBlock
              language="tsx"
              code={`import { Sidebar, SidebarSection, SidebarItem } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { Home, Settings } from "lucide-react"

export default function CollapsibleSidebar() {
  return (
    <Sidebar className="h-screen" width="md" collapsible>
      <SidebarSection title="Main">
        <SidebarItem 
          icon={<Icon icon={Home} size="sm" />} 
          href="/dashboard"
        >
          Dashboard
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Settings} size="sm" />} 
          href="/settings"
        >
          Settings
        </SidebarItem>
      </SidebarSection>
    </Sidebar>
  )
}`}
            />
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-10">
          <APIReference
            componentName="Sidebar"
            propsTable={[
              {
                prop: "width",
                type: "'sm' | 'md' | 'lg'",
                default: "'md'",
                description: "Controls the width of the sidebar. Small is 220px, Medium is 280px, Large is 340px."
              },
              {
                prop: "collapsible",
                type: "boolean",
                default: "false",
                description: "When true, shows a toggle button to collapse the sidebar."
              },
              {
                prop: "defaultCollapsed",
                type: "boolean",
                default: "false",
                description: "When true and collapsible is enabled, the sidebar starts in a collapsed state."
              },
              {
                prop: "onCollapsedChange",
                type: "(collapsed: boolean) => void",
                description: "Callback function triggered when the collapsed state changes."
              },
              {
                prop: "className",
                type: "string",
                description: "Additional CSS classes to apply to the sidebar container."
              },
              {
                prop: "children",
                type: "React.ReactNode",
                description: "Content to render inside the sidebar, typically SidebarSection components."
              }
            ]}
          />
          
          <APIReference
            componentName="SidebarSection"
            propsTable={[
              {
                prop: "title",
                type: "string",
                description: "Title text to display for the section header."
              },
              {
                prop: "collapsible",
                type: "boolean",
                default: "false",
                description: "When true, the section can be collapsed independently."
              },
              {
                prop: "defaultExpanded",
                type: "boolean",
                default: "true",
                description: "When collapsible is true, controls the initial expanded state."
              },
              {
                prop: "className",
                type: "string",
                description: "Additional CSS classes to apply to the section container."
              },
              {
                prop: "children",
                type: "React.ReactNode",
                description: "Content to render inside the section, typically SidebarItem components."
              }
            ]}
          />
          
          <APIReference
            componentName="SidebarItem"
            propsTable={[
              {
                prop: "href",
                type: "string",
                description: "URL to navigate to when the item is clicked. Rendered as a Next.js Link."
              },
              {
                prop: "icon",
                type: "React.ReactNode",
                description: "Icon element to display before the item text."
              },
              {
                prop: "active",
                type: "boolean",
                default: "false",
                description: "When true, applies active styling to indicate the current page."
              },
              {
                prop: "disabled",
                type: "boolean",
                default: "false",
                description: "When true, disables the item and prevents interaction."
              },
              {
                prop: "notification",
                type: "number | boolean",
                description: "When provided, displays a notification badge. If a number, shows the count."
              },
              {
                prop: "onClick",
                type: "(e: React.MouseEvent) => void",
                description: "Optional click handler function. When href is also provided, this executes before navigation."
              },
              {
                prop: "className",
                type: "string",
                description: "Additional CSS classes to apply to the item element."
              },
              {
                prop: "children",
                type: "React.ReactNode",
                description: "Text content or elements to display in the sidebar item."
              }
            ]}
          />
        </div>
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
                    <td className="font-mono text-xs p-3 align-top">Tab</td>
                    <td className="text-xs p-3 align-top">Navigates to the next sidebar item or toggle button.</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-mono text-xs p-3 align-top">Enter / Space</td>
                    <td className="text-xs p-3 align-top">Activates the focused sidebar item or toggles the focused section/sidebar.</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-xs p-3 align-top">Escape</td>
                    <td className="text-xs p-3 align-top">When sidebar is in a collapsible modal mode (on mobile), closes the sidebar.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">ARIA Attributes</h3>
            <p className="text-sm mb-3">
              The Sidebar components implement proper ARIA attributes for accessibility:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>The sidebar container has <code className="font-mono bg-muted px-1 rounded">role="navigation"</code> to identify it as a navigation landmark.</li>
              <li>Collapsible toggles use <code className="font-mono bg-muted px-1 rounded">aria-expanded</code> to indicate their current state.</li>
              <li>Collapsible sections use <code className="font-mono bg-muted px-1 rounded">aria-controls</code> to associate the toggle with its controlled content.</li>
              <li>Active sidebar items include <code className="font-mono bg-muted px-1 rounded">aria-current="page"</code> to indicate the current page.</li>
              <li>Disabled items have <code className="font-mono bg-muted px-1 rounded">aria-disabled="true"</code> to communicate their state to assistive technologies.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Focus Management</h3>
            <p className="text-sm">
              The sidebar components maintain keyboard focus properly, ensuring that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Focus indicators are clearly visible in high contrast against the background.</li>
              <li>Focus is preserved when collapsing/expanding sections or the entire sidebar.</li>
              <li>Interactive elements have sufficient size for touch targets (44x44px minimum).</li>
              <li>Navigation order follows a logical sequence through the sidebar items.</li>
            </ul>
          </div>
        </div>
      }
    />
  )
} 