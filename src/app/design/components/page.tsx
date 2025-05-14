"use client"

import Link from "next/link"
import { Icon } from "@/components/ui/icon"
import { 
  Square, 
  LayoutGrid, 
  FormInput, 
  Navigation2, 
  Component 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ComponentCategoryProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  className?: string
}

function ComponentCategory({ 
  icon, 
  title, 
  description, 
  href, 
  className 
}: ComponentCategoryProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "block p-6 border rounded-lg transition-all hover:border-primary",
        "hover:shadow-sm hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-xl font-medium">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </Link>
  )
}

export default function ComponentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Components</h1>
        <p className="text-lg text-muted-foreground">
          A collection of pre-built, accessible UI components for your application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComponentCategory
          icon={<Icon icon={Square} className="w-6 h-6" />}
          title="Buttons and Actions"
          description="Interactive buttons with different variants, sizes, and states."
          href="/design/components/buttons"
        />
        
        <ComponentCategory
          icon={<Icon icon={FormInput} className="w-6 h-6" />}
          title="Form Controls"
          description="Input fields, checkboxes, radio buttons, and other form elements."
          href="/design/components/forms"
        />
        
        <ComponentCategory
          icon={<Icon icon={LayoutGrid} className="w-6 h-6" />}
          title="Layout"
          description="Containers, grid systems, and other layout components."
          href="/design/components/layout"
        />
        
        <ComponentCategory
          icon={<Icon icon={Navigation2} className="w-6 h-6" />}
          title="Navigation"
          description="Navigation components like breadcrumbs, tabs, and sidebar."
          href="/design/components/navigation"
        />
      </div>

      <div className="border p-4 rounded-lg bg-amber-50 border-amber-200">
        <h3 className="font-medium mb-2">Layout System Components</h3>
        <p className="mb-4">Our responsive layout system includes several key components for building flexible, responsive layouts:</p>
        <ul className="space-y-2 ml-4">
          <li>
            <Link href="/design/components/layout/grid" className="text-blue-600 hover:underline">Grid System</Link>
            <span className="text-slate-500 text-sm ml-2">- Powerful CSS Grid-based responsive layout components</span>
          </li>
          <li>
            <Link href="/design/components/layout/flex" className="text-blue-600 hover:underline">Flex Layouts</Link>
            <span className="text-slate-500 text-sm ml-2">- Flexible row and column components using flexbox</span>
          </li>
          <li>
            <Link href="/design/components/layout/container" className="text-blue-600 hover:underline">Container</Link>
            <span className="text-slate-500 text-sm ml-2">- Responsive container component for consistent page layouts</span>
          </li>
          <li>
            <Link href="/design/components/responsive-utils" className="text-blue-600 hover:underline">Responsive Utilities</Link>
            <span className="text-slate-500 text-sm ml-2">- Helper components for responsive visibility and spacing</span>
          </li>
          <li>
            <Link href="/design/components/layout-adaptation" className="text-blue-600 hover:underline">Layout Adaptation</Link>
            <span className="text-slate-500 text-sm ml-2">- Components for adapting layouts to different viewport sizes</span>
          </li>
        </ul>
      </div>
    </div>
  )
} 