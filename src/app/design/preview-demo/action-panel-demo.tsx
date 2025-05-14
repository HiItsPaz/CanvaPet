"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ActionPanel } from "@/components/ui/action-panel";
import { ZoomablePreviewDisplay } from "@/components/ui/zoomable-preview-display";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function ActionPanelDemoPage() {
  // Sample image URL for the demo
  const [imageUrl, setImageUrl] = useState<string>("/assets/sample-pet-portrait.jpg");
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("Pet Portrait");
  const [description, setDescription] = useState<string>("A beautiful AI-generated pet portrait");
  const [showInPanel, setShowInPanel] = useState<boolean>(true);
  const [showWithZoomable, setShowWithZoomable] = useState<boolean>(true);
  
  const { toast } = useToast();

  // Handler for the download action
  const handleDownload = async (format: string, quality: string) => {
    // In a real app, this might call an API to generate the right format
    toast({
      title: "Custom Download Handler Called",
      description: `Format: ${format}, Quality: ${quality}`,
    });
  };

  // Handler for the share action
  const handleShare = async (platform: string) => {
    // In a real app, this might track analytics or call a specific API
    toast({
      title: "Custom Share Handler Called",
      description: `Platform: ${platform}`,
    });
  };

  // Handle custom image URL update
  const updateCustomImage = () => {
    if (customImageUrl) {
      setImageUrl(customImageUrl);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Action Panel Component</h1>
      <p className="text-muted-foreground mb-8">
        A comprehensive panel for downloading and sharing images with various options.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <img 
                src={imageUrl} 
                alt="Demo image"
                className="w-full h-auto rounded-md mb-4"
              />
              
              {showWithZoomable && (
                <div className="mb-6">
                  <ZoomablePreviewDisplay
                    imageUrl={imageUrl}
                    alt="Demo image"
                    title={title}
                    description={description}
                    status="success"
                    statusMessage="Processing completed successfully"
                    metadata={{
                      "Resolution": "1200 x 800 px",
                      "File size": "1.2 MB",
                      "Created": new Date().toLocaleDateString()
                    }}
                    hideControls={false}
                  />
                </div>
              )}
              
              {showInPanel && (
                <ActionPanel
                  imageUrl={imageUrl}
                  title={title}
                  description={description}
                  onDownload={handleDownload}
                  onShare={handleShare}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Configuration</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter image title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter image description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customImage">Custom Image URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="customImage" 
                        value={customImageUrl} 
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="Enter image URL"
                      />
                      <Button onClick={updateCustomImage}>
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-panel"
                      checked={showInPanel}
                      onCheckedChange={setShowInPanel}
                    />
                    <Label htmlFor="show-panel">Show Action Panel</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-zoomable"
                      checked={showWithZoomable}
                      onCheckedChange={setShowWithZoomable}
                    />
                    <Label htmlFor="show-zoomable">Show Zoomable Preview</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Sample Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="h-auto p-1"
                    onClick={() => setImageUrl("/assets/sample-pet-portrait.jpg")}
                  >
                    <img 
                      src="/assets/sample-pet-portrait.jpg" 
                      alt="Sample 1"
                      className="w-full h-auto rounded-sm"
                    />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-1"
                    onClick={() => setImageUrl("/assets/sample-dog.jpg")}
                  >
                    <img 
                      src="/assets/sample-dog.jpg" 
                      alt="Sample 2"
                      className="w-full h-auto rounded-sm"
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Usage Instructions</h2>
        <div className="rounded-md bg-muted p-4">
          <pre className="text-xs overflow-auto whitespace-pre-wrap">
            {`import { ActionPanel } from "@/components/ui/action-panel";

// Basic usage
<ActionPanel
  imageUrl="/path/to/image.jpg"
/>

// With all options
<ActionPanel
  imageUrl="/path/to/image.jpg"
  title="My Image"
  description="An awesome image"
  onDownload={(format, quality) => {
    // Custom download logic
    console.log(\`Downloading as \${format} with \${quality} quality\`);
  }}
  onShare={(platform) => {
    // Custom share logic
    console.log(\`Sharing to \${platform}\`);
  }}
  className="my-custom-class"
/>`}
          </pre>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Key Features</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Multiple download format options (JPG, PNG, WebP)</li>
          <li>Quality selection for optimizing file size</li>
          <li>Integrated social media sharing for major platforms</li>
          <li>Copy to clipboard and email sharing options</li>
          <li>Custom handlers for download and share actions</li>
          <li>Native Web Share API integration with fallbacks</li>
          <li>Loading states for asynchronous operations</li>
          <li>Responsive design for all device sizes</li>
          <li>Toast notifications for user feedback</li>
        </ul>
      </div>
    </div>
  );
} 