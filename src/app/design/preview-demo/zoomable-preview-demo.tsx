"use client";

import { useState } from "react";
import { ZoomablePreviewDisplay, ProcessingStatus } from "@/components/ui/zoomable-preview-display";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageTransitionWrapper } from "@/components/ui/page-transition-wrapper";

/**
 * Demo page for the ZoomablePreviewDisplay component
 */
export default function ZoomablePreviewDemoPage() {
  // Sample image URLs for demo
  const sampleImages = [
    {
      url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
      alt: "Cat sitting on a windowsill",
      title: "Sample Cat Portrait",
    },
    {
      url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
      alt: "Dog with tongue sticking out",
      title: "Sample Dog Portrait",
    },
    {
      url: "https://images.unsplash.com/photo-1583301286816-f4f05e1e8b25",
      alt: "Rabbit in grass",
      title: "Sample Rabbit Portrait",
    },
  ];

  // State for controlling the demo
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [title, setTitle] = useState(sampleImages[0].title);
  const [description, setDescription] = useState("This is a processed pet portrait ready for customization.");
  const [status, setStatus] = useState<ProcessingStatus>("success");
  const [statusMessage, setStatusMessage] = useState("Processing completed successfully");
  const [hideControls, setHideControls] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  
  // Sample metadata for the image
  const sampleMetadata = {
    "Original Size": "2.4 MB",
    "Processed Size": "1.2 MB",
    "Dimensions": "1200 x 800 px",
    "Processing Time": "3.2 seconds",
    "Enhancement Level": "Medium",
    "AI Model": "PetPortrait v2.3",
  };

  // Handler functions
  const handleDownload = async () => {
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Download complete");
    return Promise.resolve();
  };

  const handleShare = async () => {
    // Simulate sharing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Share complete");
    return Promise.resolve();
  };

  const handleReprocess = () => {
    console.log("Reprocessing image");
    // Simulate status change
    setStatus("warning");
    setStatusMessage("Reprocessing image...");
    
    setTimeout(() => {
      setStatus("success");
      setStatusMessage("Reprocessing completed successfully");
    }, 2000);
  };

  // Get current image data
  const currentImage = sampleImages[selectedImageIndex];

  return (
    <PageTransitionWrapper>
      <div className="container py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-4">Zoomable Preview Display Demo</h1>
        <p className="text-muted-foreground mb-8">
          This demo showcases the ZoomablePreviewDisplay component for viewing processed images with zoom capabilities.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Component */}
          <div className="lg:col-span-2">
            <ZoomablePreviewDisplay
              imageUrl={currentImage.url}
              alt={currentImage.alt}
              title={title || undefined}
              description={description || undefined}
              status={status}
              statusMessage={statusMessage}
              onDownload={handleDownload}
              onShare={handleShare}
              onReprocess={status === "error" ? handleReprocess : undefined}
              metadata={showMetadata ? sampleMetadata : undefined}
              hideControls={hideControls}
              maxHeight={500}
            />
          </div>

          {/* Controls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Component Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Selector */}
                <div className="space-y-2">
                  <Label htmlFor="image-select">Sample Image</Label>
                  <Select 
                    value={selectedImageIndex.toString()} 
                    onValueChange={(value) => setSelectedImageIndex(parseInt(value))}
                  >
                    <SelectTrigger id="image-select">
                      <SelectValue placeholder="Select an image" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleImages.map((img, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {img.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>

                <Separator />

                {/* Status Controls */}
                <div className="space-y-3">
                  <Label>Status</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={status === null ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setStatus(null)}
                    >
                      None
                    </Button>
                    <Button
                      variant={status === "success" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => {
                        setStatus("success");
                        setStatusMessage("Processing completed successfully");
                      }}
                    >
                      Success
                    </Button>
                    <Button
                      variant={status === "warning" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => {
                        setStatus("warning");
                        setStatusMessage("Processing completed with warnings");
                      }}
                    >
                      Warning
                    </Button>
                    <Button
                      variant={status === "error" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => {
                        setStatus("error");
                        setStatusMessage("Error processing image");
                      }}
                    >
                      Error
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-message">Status Message</Label>
                  <Input
                    id="status-message"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="Enter status message"
                  />
                </div>

                <Separator />

                {/* Display Options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Display Options</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hide-controls" className="cursor-pointer">Hide Zoom Controls</Label>
                    <Switch
                      id="hide-controls"
                      checked={hideControls}
                      onCheckedChange={setHideControls}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-metadata" className="cursor-pointer">Show Metadata</Label>
                    <Switch
                      id="show-metadata"
                      checked={showMetadata}
                      onCheckedChange={setShowMetadata}
                    />
                  </div>
                </div>

                <Separator />

                {/* Action Buttons Demo */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Try the Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      Test Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      Test Share
                    </Button>
                    {status === "error" && (
                      <Button variant="outline" size="sm" onClick={handleReprocess}>
                        Test Reprocess
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Usage Instructions</h2>
          <div className="rounded-md bg-muted p-4 mb-6">
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {`import { ZoomablePreviewDisplay } from "@/components/ui/zoomable-preview-display";

// Basic usage
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Processed pet image"
/>

// With all options
<ZoomablePreviewDisplay
  imageUrl="/path/to/image.jpg"
  alt="Processed pet image"
  title="My Pet Portrait"
  description="AI-enhanced portrait"
  status="success"
  statusMessage="Processing completed"
  onDownload={() => handleDownload()}
  onShare={() => handleShare()}
  onReprocess={() => handleReprocess()}
  metadata={{
    "Size": "1.2 MB",
    "Dimensions": "1200x800 px"
  }}
  hideControls={false}
  maxHeight={500}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </PageTransitionWrapper>
  );
} 