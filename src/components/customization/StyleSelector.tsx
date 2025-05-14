"use client";

import { useState, useEffect } from "react";
import { Style } from "@/types/customization";
import { StyleGrid } from "./_subcomponents/StyleGrid";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { useThumbnails } from "@/hooks/useThumbnails";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { DUMMY_STYLES } from "./DummyStyleData";
import { useSelectionHistory } from "@/hooks/useSelectionHistory";
import { SelectionHistoryDisplay } from "./_subcomponents/SelectionHistoryDisplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StyleSelectorProps {
  availableStyles: Style[];
  selectedStyleId: string | null;
  onStyleSelect: (styleId: string) => void;
  loading?: boolean;
}

// Extract unique tags from styles for filtering
const extractUniqueCategories = (styles: Style[]): string[] => {
  const categories = new Set<string>();
  styles.forEach(style => {
    if (style.tags) {
      style.tags.forEach(tag => categories.add(tag));
    }
  });
  return Array.from(categories).sort();
};

export function StyleSelector({
  availableStyles = DUMMY_STYLES,
  selectedStyleId,
  onStyleSelect,
  loading = false,
}: StyleSelectorProps) {
  // Use our thumbnail processing hook
  const { styles, isLoading } = useThumbnails(availableStyles, {
    size: "medium",
    cacheKey: "style-selector"
  });

  // Use selection history hook
  const selectedStyle = styles.find(style => style.id === selectedStyleId) || null;
  const {
    history,
    recentlyViewed,
    getPopularItems,
    select,
    view,
    clearHistory,
    hasSelection
  } = useSelectionHistory<Style>({
    initialSelection: selectedStyle,
    persistKey: "style-history",
    onSelectionChange: (style) => {
      if (style) {
        onStyleSelect(style.id);
      }
    }
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get popular items
  const popularItems = getPopularItems(10);
  
  // Get categories for filtering
  const categories = extractUniqueCategories(styles);
  
  // Handle style selection
  const handleStyleSelect = (styleId: string) => {
    const selectedStyle = styles.find(style => style.id === styleId);
    if (selectedStyle) {
      select(selectedStyle);
    }
  };
  
  // Handle style viewing (doesn't select, just records in "recently viewed")
  const handleStyleView = (style: Style) => {
    view(style);
  };
  
  // Filter styles based on search and categories
  const filteredStyles = styles.filter(style => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (style.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by categories
    const matchesCategories = selectedCategories.length === 0 || 
      style.tags?.some(tag => selectedCategories.includes(tag));
    
    return matchesSearch && matchesCategories;
  });
  
  // Toggle a category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };
  
  // Sync with external selection
  useEffect(() => {
    if (selectedStyleId) {
      const style = styles.find(s => s.id === selectedStyleId);
      if (style && (!hasSelection || style.id !== history[0]?.id)) {
        select(style);
      }
    }
  }, [selectedStyleId, styles, hasSelection, history, select]);

  return (
    <div className="space-y-6">
      {/* Selection History Display */}
      {hasSelection && (
        <SelectionHistoryDisplay
          history={history}
          recentlyViewed={recentlyViewed}
          popularItems={popularItems}
          currentSelection={selectedStyle}
          onSelect={select}
          onClearHistory={clearHistory}
          className="pt-1 pb-2"
        />
      )}
      
      {/* Search and filter controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search styles..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-7 w-7 opacity-70 hover:opacity-100"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <Button
            variant={showFilters || selectedCategories.length > 0 ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-10 w-10",
              selectedCategories.length > 0 && "bg-primary text-primary-foreground"
            )}
          >
            <Filter className="h-4 w-4" />
            {selectedCategories.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-semibold text-primary">
                {selectedCategories.length}
              </span>
            )}
          </Button>
        </div>
        
        {/* Category filter tags */}
        {showFilters && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-1.5 pb-1">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer text-xs capitalize"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
              
              {selectedCategories.length > 0 && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer text-xs"
                  onClick={clearFilters}
                >
                  Clear all
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {(loading || isLoading) ? (
        <div className="flex justify-center py-12">
          <LoadingAnimation
            variant="spinner"
            size="lg"
            text="Loading styles..."
          />
        </div>
      ) : (
        <>
          {/* Results count when filtered */}
          {(searchQuery || selectedCategories.length > 0) && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredStyles.length} of {styles.length} styles
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
              {selectedCategories.length > 0 && (
                <span>
                  {" "}
                  in{" "}
                  {selectedCategories.map((c, i) => (
                    <span key={c}>
                      {i > 0 && i < selectedCategories.length - 1 && ", "}
                      {i > 0 && i === selectedCategories.length - 1 && " and "}
                      <span className="font-medium capitalize">{c}</span>
                    </span>
                  ))}
                </span>
              )}
            </div>
          )}
          
          {/* Style grid */}
          <StyleGrid
            styles={filteredStyles}
            selectedStyleId={selectedStyleId}
            onStyleSelect={handleStyleSelect}
            highlightedCategories={selectedCategories}
          />
          
          {/* No results message */}
          {filteredStyles.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No styles found matching your criteria.</p>
              <Button
                variant="link"
                onClick={clearFilters}
                className="mt-2"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 