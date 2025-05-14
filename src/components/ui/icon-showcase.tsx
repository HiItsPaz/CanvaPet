"use client"

import React, { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { IconByName, iconCategories, iconMap } from "@/components/ui/icon-registry"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export function IconShowcase() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filter icons based on search term
  const filteredIcons = searchTerm 
    ? Object.keys(iconMap).filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Icon System</h2>
        <p className="text-muted-foreground">
          The CanvaPet design system provides a consistent set of icons powered by Lucide.
          Icons can be sized, colored, and made accessible with proper labels.
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Icon Sizes</h3>
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-center">
            <IconByName name="Heart" size="xs" className="text-primary" />
            <span className="text-xs mt-1">xs</span>
          </div>
          <div className="flex flex-col items-center">
            <IconByName name="Heart" size="sm" className="text-primary" />
            <span className="text-xs mt-1">sm</span>
          </div>
          <div className="flex flex-col items-center">
            <IconByName name="Heart" size="md" className="text-primary" />
            <span className="text-xs mt-1">md</span>
          </div>
          <div className="flex flex-col items-center">
            <IconByName name="Heart" size="lg" className="text-primary" />
            <span className="text-xs mt-1">lg</span>
          </div>
          <div className="flex flex-col items-center">
            <IconByName name="Heart" size="xl" className="text-primary" />
            <span className="text-xs mt-1">xl</span>
          </div>
          <div className="flex flex-col items-center">
            <IconByName name="Heart" size="2xl" className="text-primary" />
            <span className="text-xs mt-1">2xl</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Icon Colors</h3>
        <div className="flex gap-4">
          <IconByName name="Star" size="lg" className="text-primary" />
          <IconByName name="Star" size="lg" className="text-secondary" />
          <IconByName name="Star" size="lg" className="text-accent" />
          <IconByName name="Star" size="lg" className="text-destructive" />
          <IconByName name="Star" size="lg" className="text-muted-foreground" />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">With Labels</h3>
        <div className="flex flex-wrap gap-4">
          <IconByName name="Settings" size="md" label="Settings" labelHidden={false} />
          <IconByName name="User" size="md" label="User Profile" labelHidden={false} />
          <IconByName name="HelpCircle" size="md" label="Help" labelHidden={false} />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Icon Browser</h3>
        <Input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        
        {searchTerm ? (
          <div>
            <h4 className="text-sm font-medium mb-2">Search Results</h4>
            {filteredIcons && filteredIcons.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {filteredIcons.map(name => (
                  <IconCard key={name} name={name} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No icons found for "{searchTerm}"</p>
            )}
          </div>
        ) : (
          <Tabs defaultValue="action">
            <TabsList className="mb-4">
              {Object.keys(iconCategories).map(category => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(iconCategories).map(([category, iconNames]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {iconNames.map(name => (
                    <IconCard key={name} name={name} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Usage</h3>
        <div className="bg-muted rounded-md p-4">
          <pre className="text-sm">
{`// Import the Icon component
import { Icon } from "@/components/ui/icon";
import { Heart } from "lucide-react";

// Use directly with Lucide icons
<Icon icon={Heart} size="md" />

// Or use by name with IconByName
import { IconByName } from "@/components/ui/icon-registry";

<IconByName name="Heart" size="md" />

// Add accessibility label
<IconByName name="Heart" label="Like" />

// Show label next to icon
<IconByName name="Settings" label="Settings" labelHidden={false} />

// Mark as decorative (no semantic meaning)
<IconByName name="Sparkles" decorative />

// Apply colors and other styling
<IconByName name="Star" className="text-yellow-500" />
`}
          </pre>
        </div>
      </div>
    </div>
  )
}

function IconCard({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(name)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-4 border rounded-md hover:bg-accent/10 cursor-pointer transition-colors",
        copied && "border-primary"
      )}
      onClick={copyToClipboard}
    >
      <IconByName name={name} size="lg" className="mb-2" />
      <span className="text-xs text-center truncate w-full">{name}</span>
      {copied && (
        <span className="text-xs text-primary mt-1">Copied!</span>
      )}
    </div>
  )
}

export default IconShowcase 