"use client"

import React, { useState } from "react"
import { Smartphone, Tablet, Laptop, Monitor, Maximize, Minimize } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Navbar, NavbarItem, NavbarAction } from "@/components/ui/navbar"
import { Sidebar, SidebarSection, SidebarItem } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ResponsiveDebugger } from "@/components/ui/responsive-debugger"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type DeviceSizeType = "sm" | "md" | "lg" | "xl" | "full"

export function ResponsiveShowcase() {
  const [deviceSize, setDeviceSize] = useState<DeviceSizeType>("full")
  const [showSidebar, setShowSidebar] = useState(true)
  const [showDebugger, setShowDebugger] = useState(true)
  
  const deviceSizes = {
    sm: { width: "320px", icon: Smartphone, name: "Mobile" },
    md: { width: "768px", icon: Tablet, name: "Tablet" },
    lg: { width: "1024px", icon: Laptop, name: "Laptop" },
    xl: { width: "1280px", icon: Monitor, name: "Desktop" },
    full: { width: "100%", icon: Maximize, name: "Full Width" }
  }
  
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Responsive Component System</h2>
        <p className="text-muted-foreground">
          All components in the CanvaPet design system are designed to be responsive.
          Adjust the device size to see how components adapt to different screen sizes.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-4 pb-6">
        {(Object.keys(deviceSizes) as DeviceSizeType[]).map((size) => (
          <Button
            key={size}
            variant={deviceSize === size ? "default" : "outline"}
            onClick={() => setDeviceSize(size)}
            startIcon={<Icon icon={deviceSizes[size].icon} />}
            className="mb-1"
          >
            {deviceSizes[size].name}
          </Button>
        ))}
        
        <div className="flex items-center ml-auto">
          <Checkbox 
            id="show-debugger" 
            checked={showDebugger} 
            onCheckedChange={(checked) => setShowDebugger(checked as boolean)}
          />
          <label htmlFor="show-debugger" className="ml-2 text-sm">
            Show Responsive Debugger
          </label>
        </div>
      </div>
      
      <div
        className={cn(
          "border rounded-lg mx-auto transition-all duration-300 shadow-md bg-background relative",
          deviceSize !== "full" && "border-4 border-primary/20"
        )}
        style={{ width: deviceSizes[deviceSize].width }}
      >
        {showDebugger && (
          <div className="absolute top-2 right-2 z-50">
            <ResponsiveDebugger />
          </div>
        )}
        
        {/* Navbar */}
        <Navbar sticky>
          <NavbarItem href="#" active>
            Home
          </NavbarItem>
          <NavbarItem href="#" className="hidden sm:flex">
            About
          </NavbarItem>
          <NavbarItem href="#" className="hidden md:flex">
            Features
          </NavbarItem>
          <NavbarItem href="#" className="hidden lg:flex">
            Pricing
          </NavbarItem>
          
          <NavbarAction>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => setShowSidebar(!showSidebar)}>
                Menu
              </Button>
              <Button size="icon" variant="outline" className="sm:hidden" onClick={() => setShowSidebar(!showSidebar)}>
                <Icon icon={showSidebar ? Minimize : Maximize} />
              </Button>
            </div>
          </NavbarAction>
        </Navbar>
        
        <div className="flex">
          {/* Sidebar */}
          {showSidebar && (
            <Sidebar
              width={deviceSize === "sm" ? "sm" : "md"}
              collapsible={deviceSize !== "sm"}
              overlay={deviceSize === "sm"}
              className="h-[700px]"
            >
              <SidebarSection title="Main Menu">
                <SidebarItem icon={<Icon icon={deviceSizes.full.icon} size="sm" />} active>
                  Dashboard
                </SidebarItem>
                <SidebarItem icon={<Icon icon={deviceSizes.sm.icon} size="sm" />}>
                  Pets
                </SidebarItem>
                <SidebarItem icon={<Icon icon={deviceSizes.md.icon} size="sm" />}>
                  Gallery
                </SidebarItem>
              </SidebarSection>
              <SidebarSection title="Settings" collapsible className="hidden sm:block">
                <SidebarItem icon={<Icon icon={deviceSizes.lg.icon} size="sm" />}>
                  Profile
                </SidebarItem>
                <SidebarItem icon={<Icon icon={deviceSizes.xl.icon} size="sm" />}>
                  Preferences
                </SidebarItem>
              </SidebarSection>
            </Sidebar>
          )}
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 overflow-x-auto">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
              <BreadcrumbItem href="#">Dashboard</BreadcrumbItem>
              <BreadcrumbItem href="#" className="hidden sm:inline-flex">Components</BreadcrumbItem>
              <BreadcrumbItem current>Responsive Demo</BreadcrumbItem>
            </Breadcrumb>
            
            <h1 className="text-xl md:text-2xl font-bold mb-4">Responsive Components</h1>
            <p className="text-muted-foreground mb-6">
              Current viewport: <Badge variant="outline">{deviceSizes[deviceSize].name}</Badge>
            </p>
            
            {/* Form controls */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Responsive Form</CardTitle>
                <CardDescription>Form elements adapt to different screen sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="First Name" placeholder="Enter first name" />
                    <Input label="Last Name" placeholder="Enter last name" className="hidden sm:block" />
                  </div>
                  <Input label="Email" placeholder="Enter email address" icon={<Icon icon={deviceSizes.sm.icon} size="sm" />} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="hidden sm:block lg:hidden">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pet age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="puppy">Puppy/Kitten</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="hidden lg:block">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pet size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="hidden lg:block">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pet breed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">Mixed</SelectItem>
                          <SelectItem value="purebred">Purebred</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
                    <Checkbox id="checkbox-terms" label="I agree to the terms" />
                    <Checkbox id="checkbox-updates" label="Send me updates" className="hidden md:flex" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button className="w-full">Submit</Button>
                    <Button variant="outline" className="w-full hidden sm:inline-flex">Reset</Button>
                    <Button variant="ghost" className="w-full hidden md:inline-flex">Cancel</Button>
                    <Button variant="secondary" className="w-full hidden lg:inline-flex">Help</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tabs */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Responsive Tabs</CardTitle>
                <CardDescription>Tab layouts adapt to different screen sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="grid grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="settings" className="hidden md:inline-flex">Settings</TabsTrigger>
                    <TabsTrigger value="help" className="hidden md:inline-flex">Help</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="p-4 border rounded-md mt-2">
                    <div className="text-sm">
                      <h3 className="font-medium mb-2">Product Details</h3>
                      <p className="text-muted-foreground">
                        This tab shows the basic details. On small screens,
                        only this and Preview tabs are shown.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="p-4 border rounded-md mt-2">
                    <div className="text-sm">
                      <h3 className="font-medium mb-2">Product Preview</h3>
                      <p className="text-muted-foreground">
                        This tab shows the product preview.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="settings" className="p-4 border rounded-md mt-2">
                    <div className="text-sm">
                      <h3 className="font-medium mb-2">Product Settings</h3>
                      <p className="text-muted-foreground">
                        This tab is hidden on mobile devices.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="help" className="p-4 border rounded-md mt-2">
                    <div className="text-sm">
                      <h3 className="font-medium mb-2">Help Information</h3>
                      <p className="text-muted-foreground">
                        This tab is hidden on mobile devices.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Responsive Cards Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Responsive Card Grid</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <Card key={item}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Card {item}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs md:text-sm text-muted-foreground">
                        This card resizes based on viewport.
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">Share</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">Key Responsive Design Principles</h3>
        <ul className="space-y-2">
          <li className="text-sm">
            <span className="font-medium">Mobile-First Approach:</span>{" "}
            All components are built with a mobile-first approach, then enhanced for larger screens.
          </li>
          <li className="text-sm">
            <span className="font-medium">Fluid Layouts:</span>{" "}
            Using relative units (percentages, rem, em) rather than fixed pixels.
          </li>
          <li className="text-sm">
            <span className="font-medium">Progressive Enhancement:</span>{" "}
            Core functionality works on all devices, with enhanced features on larger screens.
          </li>
          <li className="text-sm">
            <span className="font-medium">Media Queries:</span>{" "}
            Using Tailwind&apos;s breakpoints (sm, md, lg, xl, 2xl) consistently.
          </li>
          <li className="text-sm">
            <span className="font-medium">Responsive Typography:</span>{" "}
            Text sizes adjust proportionally across screen sizes.
          </li>
          <li className="text-sm">
            <span className="font-medium">Touch-Friendly:</span>{" "}
            Interactive elements are sized appropriately for touch on mobile.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ResponsiveShowcase 