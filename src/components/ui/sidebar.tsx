"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "left" | "right"
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  collapsible?: boolean
  className?: string
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  overlay?: boolean
  breakpoint?: "sm" | "md" | "lg" | "xl"
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ 
    className, 
    position = "left", 
    collapsed = false, 
    onCollapse,
    collapsible = false,
    width = "md",
    overlay = false,
    breakpoint = "md",
    children,
    ...props 
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = React.useState(collapsed)
    const breakpointMap = {
      sm: "sm",
      md: "md",
      lg: "lg",
      xl: "xl"
    }
    
    // Width mapping to Tailwind classes
    const widthClasses = {
      sm: isCollapsed ? "w-16" : "w-56",
      md: isCollapsed ? "w-20" : "w-64",
      lg: isCollapsed ? "w-24" : "w-72",
      xl: isCollapsed ? "w-28" : "w-80",
      "2xl": isCollapsed ? "w-32" : "w-96",
      full: isCollapsed ? "w-36" : "w-full"
    }
    
    // Handle controlled/uncontrolled collapsed state
    React.useEffect(() => {
      setIsCollapsed(collapsed)
    }, [collapsed])
    
    const handleToggleCollapse = () => {
      const newCollapsedState = !isCollapsed
      setIsCollapsed(newCollapsedState)
      onCollapse?.(newCollapsedState)
    }
    
    return (
      <div
        ref={ref}
        data-state={isCollapsed ? "collapsed" : "expanded"}
        className={cn(
          "flex flex-col h-full transition-all duration-300 ease-in-out bg-background",
          position === "left" ? "border-r" : "border-l",
          overlay ? "absolute z-40" : "relative",
          position === "left" ? "left-0" : "right-0",
          widthClasses[width as keyof typeof widthClasses],
          `${breakpointMap[breakpoint]}:block`,
          breakpoint !== "xl" && `max-${breakpointMap[breakpoint]}:${overlay ? "fixed inset-y-0" : "hidden"}`,
          className
        )}
        {...props}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
          {children}
        </div>
        
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 rounded-full p-0 h-6 w-6 flex items-center justify-center",
              position === "left" 
                ? "right-[-12px]" 
                : "left-[-12px]"
            )}
            onClick={handleToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {position === "left" ? (
              isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )
            ) : (
              isCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            )}
          </Button>
        )}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ 
    className, 
    title, 
    collapsible = false,
    defaultCollapsed = false,
    children,
    ...props 
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
    
    return (
      <div
        ref={ref}
        className={cn("py-2", className)}
        {...props}
      >
        {title && (
          <div 
            className={cn(
              "flex items-center px-4 py-2",
              collapsible && "cursor-pointer"
            )}
            onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
          >
            <h3 className="text-sm font-semibold text-foreground">
              {title}
            </h3>
            {collapsible && (
              <ChevronRight 
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  !isCollapsed && "rotate-90"
                )} 
              />
            )}
          </div>
        )}
        {(!collapsible || !isCollapsed) && (
          <div className="mt-1">
            {children}
          </div>
        )}
      </div>
    )
  }
)
SidebarSection.displayName = "SidebarSection"

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string
  active?: boolean
  icon?: React.ReactNode
  disabled?: boolean
}

const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ 
    className, 
    href, 
    active = false, 
    icon,
    disabled = false,
    children,
    ...props 
  }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn(
          "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
          active 
            ? "bg-accent text-accent-foreground" 
            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        <span className="truncate">{children}</span>
      </div>
    )
    
    if (href && !disabled) {
      return (
        <a href={href} className="block">
          {content}
        </a>
      )
    }
    
    return content
  }
)
SidebarItem.displayName = "SidebarItem"

export { Sidebar, SidebarSection, SidebarItem } 