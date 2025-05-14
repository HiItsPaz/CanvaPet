"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    appearance?: "line" | "enclosed" | "pills"
    fullWidth?: boolean
  }
>(({ className, appearance = "line", fullWidth = false, ...props }, ref) => {
  // Only applying classes to the Tabs component itself, 
  // the appearance styles are used in the list and content
  return (
    <TabsPrimitive.Root
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    />
  )
})
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    appearance?: "line" | "enclosed" | "pills"
    fullWidth?: boolean
  }
>(({ className, appearance = "line", fullWidth = false, ...props }, ref) => {
  const appearanceClasses = {
    line: "border-b border-border",
    enclosed: "bg-muted rounded-none rounded-t-lg p-0",
    pills: "bg-transparent p-1 rounded-lg bg-muted/50",
  }
  
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex h-10 items-center",
        appearanceClasses[appearance],
        fullWidth ? "justify-stretch w-full" : "justify-start",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    appearance?: "line" | "enclosed" | "pills"
    fullWidth?: boolean
    icon?: React.ReactNode
  }
>(({ className, appearance = "line", fullWidth = false, icon, children, ...props }, ref) => {
  const appearanceClasses = {
    line: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
    enclosed: "rounded-none rounded-t-lg border-b-0 data-[state=active]:bg-background data-[state=active]:shadow-none",
    pills: "rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm",
  }
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        appearanceClasses[appearance],
        fullWidth && "flex-1",
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    appearance?: "line" | "enclosed" | "pills"
  }
>(({ className, appearance = "line", ...props }, ref) => {
  const appearanceClasses = {
    line: "mt-2",
    enclosed: "bg-background p-6 rounded-b-lg border-b border-l border-r",
    pills: "mt-2",
  }
  
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        appearanceClasses[appearance],
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
