"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Example data - in a real implementation, these could come from a config file or API
const guidelineItems = [
  {
    id: "lighting",
    title: "Good lighting",
    description: "Natural daylight is best. Avoid harsh shadows or very dim lighting.",
    goodExample: "/images/guidelines/good-lighting.jpg", // Placeholder - would need actual images
    badExample: "/images/guidelines/bad-lighting.jpg",
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
  },
  {
    id: "face",
    title: "Clear face view",
    description: "Ensure your pet's face is clearly visible and not obscured.",
    goodExample: "/images/guidelines/good-face.jpg",
    badExample: "/images/guidelines/bad-face.jpg",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "distance",
    title: "Proper distance",
    description: "Not too close (cropped) or too far (tiny pet in frame).",
    goodExample: "/images/guidelines/good-distance.jpg",
    badExample: "/images/guidelines/bad-distance.jpg",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "background",
    title: "Simple background",
    description: "Aim for clean, uncluttered backgrounds for best results.",
    goodExample: "/images/guidelines/good-background.jpg",
    badExample: "/images/guidelines/bad-background.jpg",
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
  },
  {
    id: "blur",
    title: "No motion blur",
    description: "Ensure your pet is still when taking the photo.",
    goodExample: "/images/guidelines/good-sharp.jpg",
    badExample: "/images/guidelines/bad-blur.jpg",
    icon: <XCircle className="h-5 w-5 text-rose-500" />,
  },
];

const tips = [
  "Use treats to get your pet's attention",
  "Take multiple photos to ensure you get a good one",
  "Try to photograph your pet at eye level",
  "Make sure your pet is comfortable and not stressed",
  "Clean any eye discharge or food around the mouth if possible",
];

interface PhotoGuidelinesProps {
  className?: string;
  compact?: boolean;
}

export function PhotoGuidelines({ className, compact = false }: PhotoGuidelinesProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Photo Guidelines</h3>
        <p className="text-muted-foreground">
          Follow these tips to get the best results when uploading your pet photos.
        </p>
      </div>

      {compact ? (
        <CompactGuidelines />
      ) : (
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>
          <TabsContent value="checklist" className="mt-4">
            <ChecklistView />
          </TabsContent>
          <TabsContent value="examples" className="mt-4">
            <ExamplesView />
          </TabsContent>
          <TabsContent value="tips" className="mt-4">
            <TipsView />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function CompactGuidelines() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Good lighting, clear face view, simple background</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span>No blurry photos, extreme closeups, or dark lighting</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            See the examples tab for more detailed guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistView() {
  return (
    <Card>
      <CardContent className="p-4">
        <ul className="space-y-4">
          {guidelineItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div className="mt-0.5">{item.icon}</div>
              <div>
                <h4 className="font-medium text-base">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ExamplesView() {
  return (
    <div className="space-y-6">
      {guidelineItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <h4 className="font-medium text-base mb-2">{item.title}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative h-40 w-full rounded-md bg-muted/50 overflow-hidden border">
                  {/* In production, replace with actual images */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Good Example</p>
                      <p className="text-xs text-muted-foreground">
                        (Image placeholder)
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">Good example</p>
              </div>

              <div className="space-y-2">
                <div className="relative h-40 w-full rounded-md bg-muted/50 overflow-hidden border">
                  {/* In production, replace with actual images */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <XCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Bad Example</p>
                      <p className="text-xs text-muted-foreground">
                        (Image placeholder)
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">Not recommended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TipsView() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <p className="text-sm">
            Follow these tips to get the best possible photos of your pet.
          </p>
        </div>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 