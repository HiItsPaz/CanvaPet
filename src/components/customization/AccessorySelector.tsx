"use client";

// import { useState } from 'react'; // Removed unused useState
import { Accessory } from "@/types/customization";
// import { Button } from "@/components/ui/button"; // Removed unused Button
// Removed unused Card, CardContent imports
// Checkbox is not used, visual checkmark is used instead
import { Label } from "@/components/ui/label"; // Ensure Label is imported
// import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AccessorySelectorProps {
  availableAccessories: Accessory[];
  selectedAccessoryIds: string[];
  onAccessoryToggle: (accessoryId: string, isSelected: boolean) => void;
  loading?: boolean;
}

// Dummy data for now
const DUMMY_ACCESSORIES: Accessory[] = [
  {
    id: "hat-1",
    name: "Top Hat",
    thumbnailUrl: "/placeholders/acc-tophat.png",
    category: "Hats",
  },
  {
    id: "glasses-1",
    name: "Cool Shades",
    thumbnailUrl: "/placeholders/acc-shades.png",
    category: "Eyewear",
  },
  {
    id: "bowtie-1",
    name: "Dapper Bowtie",
    thumbnailUrl: "/placeholders/acc-bowtie.png",
    category: "Neckwear",
  },
  {
    id: "crown-1",
    name: "Royal Crown",
    thumbnailUrl: "/placeholders/acc-crown.png",
    category: "Hats",
  },
  {
    id: "scarf-1",
    name: "Cozy Scarf",
    thumbnailUrl: "/placeholders/acc-scarf.png",
    category: "Neckwear",
  },
];

export function AccessorySelector({
  availableAccessories = DUMMY_ACCESSORIES,
  selectedAccessoryIds,
  onAccessoryToggle,
  loading = false,
}: AccessorySelectorProps) {
  // Group accessories by category
  const groupedAccessories = availableAccessories.reduce((acc, accessory) => {
    const category = accessory.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(accessory);
    return acc;
  }, {} as Record<string, Accessory[]>);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-1/3 bg-muted rounded animate-pulse"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-1/4 bg-muted rounded animate-pulse"></div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-20 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (Object.keys(groupedAccessories).length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Accessories</h3>
        <p className="text-sm text-muted-foreground">No accessories available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Accessories</h3>
      {/* <ScrollArea className="h-[300px] pr-3"> */}
        {Object.entries(groupedAccessories).map(([category, accessories]) => (
          <div key={category} className="mb-4">
            <h4 className="text-md font-medium mb-2 capitalize">{category}</h4>
            <div className="grid grid-cols-3 gap-2">
              {accessories.map((acc) => {
                const isSelected = selectedAccessoryIds.includes(acc.id);
                return (
                  <button // Changed div to button for better accessibility and click handling
                    type="button"
                    key={acc.id}
                    className={cn(
                      "border rounded-md p-2 flex flex-col items-center justify-center space-y-1 cursor-pointer hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      isSelected && "ring-2 ring-primary bg-accent"
                    )}
                    onClick={() => onAccessoryToggle(acc.id, !isSelected)}
                    aria-pressed={isSelected}
                  >
                    <div className="relative w-12 h-12 mb-1">
                      <Image
                        src={acc.thumbnailUrl || "/placeholder-image.jpg"}
                        alt={acc.name}
                        fill
                        sizes="50px"
                        className="object-contain"
                      />
                    </div>
                    <Label className="text-xs text-center truncate w-full pointer-events-none" title={acc.name}>
                      {acc.name}
                    </Label>
                    {/* Visual checkmark instead of Checkbox component */}
                    <div className={cn(
                      "h-5 w-5 rounded border flex items-center justify-center mt-1",
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
                    )}>
                      {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      {/* </ScrollArea> */}
    </div>
  );
} 