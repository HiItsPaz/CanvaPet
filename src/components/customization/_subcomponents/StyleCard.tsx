"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Style } from "@/types/customization";
import { CheckCircle } from "lucide-react";

interface StyleCardProps {
  style: Style;
  isSelected: boolean;
  onSelect: (styleId: string) => void;
}

export function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        isSelected ? "ring-2 ring-primary shadow-lg" : "ring-1 ring-transparent"
      )}
      onClick={() => onSelect(style.id)}
    >
      <CardHeader className="p-0 relative aspect-[4/3]">
        <Image
          src={style.thumbnailUrl || "/placeholder-image.jpg"} // Fallback placeholder
          alt={style.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover rounded-t-lg"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <CheckCircle className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-md font-semibold truncate" title={style.name}>{style.name}</CardTitle>
        {style.description && (
          <CardDescription className="text-xs mt-1 truncate" title={style.description}>
            {style.description}
          </CardDescription>
        )}
        {/* We can add tags here later if needed */}
      </CardContent>
    </Card>
  );
} 