"use client";

import { Style } from "@/types/customization";
import { StyleCard } from "./_subcomponents/StyleCard";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Removed for now

interface StyleSelectorProps {
  availableStyles: Style[];
  selectedStyleId: string | null;
  onStyleSelect: (styleId: string) => void;
  loading?: boolean;
}

// Dummy data for now - this will come from props/API later
const DUMMY_STYLES: Style[] = [
  {
    id: "realistic",
    name: "Realistic",
    description: "A true-to-life representation of your pet.",
    thumbnailUrl: "/placeholders/style-realistic.jpg",
  },
  {
    id: "cartoon",
    name: "Cartoon Fun",
    description: "A playful, animated version of your furry friend.",
    thumbnailUrl: "/placeholders/style-cartoon.jpg",
  },
  {
    id: "watercolor",
    name: "Watercolor Dreams",
    description: "Soft, flowing colors create an artistic impression.",
    thumbnailUrl: "/placeholders/style-watercolor.jpg",
  },
  {
    id: "oil-painting",
    name: "Oil Painting Classic",
    description: "A timeless, textured oil painting look.",
    thumbnailUrl: "/placeholders/style-oil.jpg",
  },
  {
    id: "pop-art",
    name: "Pop Art Power",
    description: "Bold colors and iconic pop-art flair.",
    thumbnailUrl: "/placeholders/style-popart.jpg",
  },
  {
    id: "pencil-sketch",
    name: "Pencil Sketch",
    description: "A detailed and artistic pencil drawing.",
    thumbnailUrl: "/placeholders/style-sketch.jpg",
  },
  {
    id: "fantasy-art",
    name: "Fantasy Realm",
    description: "Transform your pet into a mythical creature.",
    thumbnailUrl: "/placeholders/style-fantasy.jpg",
  },
];

export function StyleSelector({
  availableStyles = DUMMY_STYLES, // Use dummy data as default for now
  selectedStyleId,
  onStyleSelect,
  loading = false,
}: StyleSelectorProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-1/3 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!availableStyles || availableStyles.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Style</h3>
        <p className="text-sm text-muted-foreground">No styles available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Select Style</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableStyles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              isSelected={selectedStyleId === style.id}
              onSelect={onStyleSelect}
            />
        ))}
      </div>
    </div>
  );
} 