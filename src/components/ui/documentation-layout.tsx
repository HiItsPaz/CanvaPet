"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Sidebar, SidebarSection, SidebarItem } from "@/components/ui/sidebar"
import { 
  ChevronLeft, 
  Home, 
  Code, 
  Palette, 
  Type, 
  Component, 
  Grid, 
  Accessibility, 
  ShieldCheck, 
  Layout, 
  LayoutGrid,
  Square
} from "lucide-react"

interface DocSidebarProps {
  className?: string
}

export function DocSidebar({ className }: DocSidebarProps) {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }
  
  return (
    <Sidebar className={cn("h-[calc(100vh-64px)] border-r", className)} width="md" collapsible>
      <div className="px-3 py-2">
        <Link href="/design">
          <Button variant="ghost" className="w-full justify-start" startIcon={<Icon icon={ChevronLeft} />}>
            Back to Design System
          </Button>
        </Link>
      </div>
      
      <SidebarSection title="Overview">
        <SidebarItem 
          icon={<Icon icon={Home} size="sm" />} 
          href="/design"
          active={pathname === "/design"}
        >
          Getting Started
        </SidebarItem>
      </SidebarSection>
      
      <SidebarSection title="Foundations">
        <SidebarItem 
          icon={<Icon icon={Palette} size="sm" />} 
          href="/design/colors"
          active={isActive("/design/colors")}
        >
          Colors
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Type} size="sm" />} 
          href="/design/typography"
          active={isActive("/design/typography")}
        >
          Typography
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Code} size="sm" />} 
          href="/design/icons"
          active={isActive("/design/icons")}
        >
          Icons
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={LayoutGrid} size="sm" />} 
          href="/design/responsive"
          active={isActive("/design/responsive")}
        >
          Responsive
        </SidebarItem>
      </SidebarSection>
      
      <SidebarSection title="Components">
        <SidebarItem 
          icon={<Icon icon={Component} size="sm" />} 
          href="/design/components"
          active={isActive("/design/components")}
        >
          Overview
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Layout} size="sm" />} 
          href="/design/components/layout"
          active={isActive("/design/components/layout")}
        >
          Layout
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Square} size="sm" />} 
          href="/design/components/buttons"
          active={isActive("/design/components/buttons")}
        >
          Buttons
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Grid} size="sm" />} 
          href="/design/components/cards"
          active={isActive("/design/components/cards")}
        >
          Cards
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Code} size="sm" />} 
          href="/design/components/forms"
          active={isActive("/design/components/forms")}
        >
          Forms
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={Code} size="sm" />} 
          href="/design/components/navigation"
          active={isActive("/design/components/navigation")}
        >
          Navigation
        </SidebarItem>
      </SidebarSection>
      
      <SidebarSection title="Guidelines">
        <SidebarItem 
          icon={<Icon icon={Accessibility} size="sm" />} 
          href="/design/accessibility"
          active={isActive("/design/accessibility")}
        >
          Accessibility
        </SidebarItem>
        <SidebarItem 
          icon={<Icon icon={ShieldCheck} size="sm" />} 
          href="/design/best-practices"
          active={isActive("/design/best-practices")}
        >
          Best Practices
        </SidebarItem>
      </SidebarSection>
    </Sidebar>
  )
}

interface DocumentationLayoutProps {
  children: React.ReactNode
  fullWidth?: boolean
}

export function DocumentationLayout({ children, fullWidth = false }: DocumentationLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DocSidebar className="hidden md:block" />
      
      <div className="flex-1 overflow-auto">
        <main className={cn(
          "py-12",
          fullWidth ? "container mx-auto" : "container mx-auto max-w-4xl"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DocumentationLayout 