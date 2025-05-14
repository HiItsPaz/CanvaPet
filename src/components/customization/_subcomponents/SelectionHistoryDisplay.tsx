"use client";

import { cn } from "@/lib/utils";
import { Style } from "@/types/customization";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Star, Eye, ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState } from "react";
import { BlurHashImage } from "./BlurHashImage";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SelectionHistoryDisplayProps {
  history?: Style[];
  recentlyViewed?: Style[];
  popularItems?: Style[];
  currentSelection: Style | null;
  onSelect: (style: Style) => void;
  onClearHistory?: () => void;
  className?: string;
}

export function SelectionHistoryDisplay({
  history = [],
  recentlyViewed = [],
  popularItems = [],
  currentSelection,
  onSelect,
  onClearHistory,
  className,
}: SelectionHistoryDisplayProps) {
  const [activeSection, setActiveSection] = useState<'history' | 'recent' | 'popular'>('history');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Determine which items to display based on active section
  const itemsToDisplay = activeSection === 'history' 
    ? history 
    : activeSection === 'recent' 
      ? recentlyViewed 
      : popularItems;
  
  // Handle scrolling left/right
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.8;
    
    scrollRef.current.scrollTo({
      left: direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };
  
  // Empty state message based on active section
  const getEmptyMessage = () => {
    switch (activeSection) {
      case 'history': return "No selection history yet";
      case 'recent': return "No recently viewed styles";
      case 'popular': return "No popular styles yet";
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={activeSection === 'history' ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection('history')}
            className="h-8"
          >
            <History className="h-3.5 w-3.5 mr-1" />
            History
          </Button>
          <Button
            variant={activeSection === 'recent' ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection('recent')}
            className="h-8"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Recent
          </Button>
          <Button
            variant={activeSection === 'popular' ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection('popular')}
            className="h-8"
          >
            <Star className="h-3.5 w-3.5 mr-1" />
            Popular
          </Button>
        </div>
        
        {activeSection === 'history' && onClearHistory && history.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClearHistory}
                  className="h-8 w-8"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="relative">
        <ScrollArea className="w-full pb-4">
          <div ref={scrollRef} className="relative">
            {itemsToDisplay.length > 0 ? (
              <div className="flex space-x-2 py-1">
                {itemsToDisplay.map((style) => (
                  <div 
                    key={style.id}
                    className={cn(
                      "flex-shrink-0 w-16 transition-all cursor-pointer rounded-md overflow-hidden",
                      currentSelection?.id === style.id 
                        ? "ring-2 ring-primary" 
                        : "ring-1 ring-transparent hover:ring-1 hover:ring-muted-foreground/30"
                    )}
                    onClick={() => onSelect(style)}
                  >
                    <div className="relative aspect-square w-full">
                      <BlurHashImage
                        src={style.thumbnailUrl || "/placeholder-image.jpg"}
                        blurHash={style.blurhash}
                        alt={style.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-1 text-center">
                      <p className="text-xs truncate" title={style.name}>
                        {style.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {getEmptyMessage()}
              </div>
            )}
            <ScrollBar orientation="horizontal" />
          </div>
        </ScrollArea>
        
        {itemsToDisplay.length > 4 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-80 hover:opacity-100"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-80 hover:opacity-100"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {activeSection === 'history' && currentSelection && (
        <div className="flex items-center space-x-2 pt-1">
          <Badge variant="outline" className="text-xs">Current</Badge>
          <p className="text-sm truncate">{currentSelection.name}</p>
        </div>
      )}
    </div>
  );
} 