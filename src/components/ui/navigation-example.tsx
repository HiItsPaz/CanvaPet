"use client"

import React from "react"
import { Home, Settings, User, FilePlus, Menu, Search } from "lucide-react"

import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Navbar, NavbarItem, NavbarAction } from "@/components/ui/navbar"
import { Sidebar, SidebarSection, SidebarItem } from "@/components/ui/sidebar"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NavigationExample() {
  const [showSidebar, setShowSidebar] = React.useState(true)
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar Example */}
      <Navbar sticky>
        <NavbarItem href="/" active>
          Home
        </NavbarItem>
        <NavbarItem href="/about">
          About
        </NavbarItem>
        <NavbarItem href="/features">
          Features
        </NavbarItem>
        <NavbarItem href="/pricing">
          Pricing
        </NavbarItem>
        
        <NavbarAction>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search..." 
              className="w-auto max-w-[160px] h-8"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </NavbarAction>
      </Navbar>
      
      <div className="flex flex-1">
        {/* Sidebar Example */}
        {showSidebar && (
          <Sidebar
            collapsible
            onCollapse={(state) => console.log("Sidebar collapsed:", state)}
            className="h-[calc(100vh-4rem)]"
          >
            <SidebarSection>
              <SidebarItem icon={<Home className="h-4 w-4" />} active>
                Dashboard
              </SidebarItem>
              <SidebarItem icon={<FilePlus className="h-4 w-4" />} href="/documents">
                Documents
              </SidebarItem>
              <SidebarItem icon={<User className="h-4 w-4" />} href="/profile">
                Profile
              </SidebarItem>
            </SidebarSection>
            
            <SidebarSection title="Settings" collapsible>
              <SidebarItem icon={<Settings className="h-4 w-4" />}>
                General
              </SidebarItem>
              <SidebarItem disabled>
                Advanced (coming soon)
              </SidebarItem>
            </SidebarSection>
          </Sidebar>
        )}
        
        <main className="flex-1 p-6">
          {/* Breadcrumb Example */}
          <Breadcrumb className="mb-4">
            <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
            <BreadcrumbItem href="/dashboard/settings">Settings</BreadcrumbItem>
            <BreadcrumbItem current>Profile</BreadcrumbItem>
          </Breadcrumb>
          
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="mb-4"
            >
              <Menu className="h-4 w-4 mr-2" />
              Toggle Sidebar
            </Button>
            
            <h1 className="text-2xl font-bold mb-4">Navigation Components</h1>
            <p className="text-muted-foreground mb-8">
              This page demonstrates all the navigation components working together in a layout.
            </p>
          </div>
          
          {/* Tabs Example */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Tab Styles</h2>
            
            <div className="space-y-6">
              <Tabs defaultValue="personal">
                <TabsList>
                  <TabsTrigger value="personal" icon={<User className="h-4 w-4" />}>
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="settings" icon={<Settings className="h-4 w-4" />}>
                    Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="personal">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium">Personal Info Tab Content</h3>
                    <p className="text-muted-foreground">This is using the default "line" style for tabs.</p>
                  </div>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium">Settings Tab Content</h3>
                    <p className="text-muted-foreground">This is using the default "line" style for tabs.</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Tabs defaultValue="personal" appearance="enclosed">
                <TabsList appearance="enclosed">
                  <TabsTrigger value="personal" appearance="enclosed">
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="settings" appearance="enclosed">
                    Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="personal" appearance="enclosed">
                  <h3 className="font-medium">Personal Info Tab Content</h3>
                  <p className="text-muted-foreground">This is using the "enclosed" style for tabs.</p>
                </TabsContent>
                <TabsContent value="settings" appearance="enclosed">
                  <h3 className="font-medium">Settings Tab Content</h3>
                  <p className="text-muted-foreground">This is using the "enclosed" style for tabs.</p>
                </TabsContent>
              </Tabs>
              
              <Tabs defaultValue="personal" appearance="pills">
                <TabsList appearance="pills">
                  <TabsTrigger value="personal" appearance="pills">
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="settings" appearance="pills">
                    Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="personal" appearance="pills">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium">Personal Info Tab Content</h3>
                    <p className="text-muted-foreground">This is using the "pills" style for tabs.</p>
                  </div>
                </TabsContent>
                <TabsContent value="settings" appearance="pills">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium">Settings Tab Content</h3>
                    <p className="text-muted-foreground">This is using the "pills" style for tabs.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Other pages could go here */}
        </main>
      </div>
    </div>
  )
} 