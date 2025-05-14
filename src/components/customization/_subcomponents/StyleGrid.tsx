"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback, KeyboardEvent } from "react";
import { Style } from "@/types/customization";
import { StyleCard } from "./StyleCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FixedSizeGrid, FixedSizeList, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import memoize from 'memoize-one';
import { Input } from "@/components/ui/input";
import { Search, Info } from "lucide-react";
import { debounce } from "lodash";

interface StyleGridProps {
  styles: Style[];
  selectedStyleId: string | null;
  onStyleSelect: (styleId: string) => void;
  highlightedCategories?: string[];
  maxItemsBeforeVirtualization?: number;
}

// Importance score calculation for positioning
const calculateImportance = (style: Style): number => {
  let score = 0;
  
  // Add points for various importance factors
  if (style.tags?.includes("featured")) score += 30;
  if (style.tags?.includes("premium")) score += 20;
  
  // More points for specific categories
  if (style.tags?.includes("portrait")) score += 15;
  if (style.tags?.includes("artistic")) score += 10;
  if (style.tags?.includes("cartoon")) score += 8;
  
  // Add some randomness for variety (avoid ties)
  score += Math.random() * 5;
  
  return score;
};

// Memoized Style Card item for virtualized lists
const MemoizedStyleCard = React.memo(StyleCard);

// Grid item renderer for react-window
const GridItem = ({ 
  data, 
  columnIndex, 
  rowIndex, 
  style: itemStyle 
}: {
  data: {
    items: any[],
    columnCount: number,
    onSelect: (id: string) => void,
    selectedId: string | null,
    gridLayout: "compact" | "regular" | "expanded",
    focusedIndex: number,
    isKeyboardNavigation: boolean,
    onFocus: (index: number) => void,
    getItemAriaLabel: (item: any) => string
  },
  columnIndex: number,
  rowIndex: number,
  style: React.CSSProperties
}) => {
  const { 
    items, 
    columnCount, 
    onSelect, 
    selectedId, 
    gridLayout, 
    focusedIndex, 
    isKeyboardNavigation,
    onFocus,
    getItemAriaLabel
  } = data;
  const itemIndex = rowIndex * columnCount + columnIndex;
  
  if (itemIndex >= items.length) {
    return null; // Return null for empty cells
  }
  
  const item = items[itemIndex];
  const { style: styleItem, importance, isPremium, isHighlighted } = item;
  
  // Calculate if this item is focused
  const isFocused = itemIndex === focusedIndex && isKeyboardNavigation;
  
  return (
    <div 
      style={{
        ...itemStyle,
        padding: '0.375rem', // equivalent to gap-3 divided by 2
      }}
      className="flex"
    >
      <div 
        className={cn(
          "flex-1 transform transition-all",
          isHighlighted && "scale-105 z-10",
          isFocused && "z-10 ring-2 ring-primary ring-offset-2"
        )}
        onFocus={() => onFocus(itemIndex)}
      >
        <MemoizedStyleCard
          style={styleItem}
          isSelected={selectedId === styleItem.id}
          onSelect={onSelect}
          size={isPremium && gridLayout !== "compact" ? "large" : "regular"}
          highlighted={isHighlighted || isFocused}
          ariaLabel={getItemAriaLabel(item)}
        />
      </div>
    </div>
  );
};

// Memoized grid item to prevent unnecessary re-renders
const MemoizedGridItem = React.memo(GridItem, areEqual);

export function StyleGrid({
  styles,
  selectedStyleId,
  onStyleSelect,
  highlightedCategories = [],
  maxItemsBeforeVirtualization = 30,
}: StyleGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridLayout, setGridLayout] = useState<"compact" | "regular" | "expanded">("regular");
  
  // Track currently focused item for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // Track if we're in keyboard navigation mode
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Should virtualization be used
  const [useVirtualization, setUseVirtualization] = useState(false);

  // Track the last announcement for screen readers
  const [announcement, setAnnouncement] = useState("");

  // Determine grid layout based on container width
  useEffect(() => {
    if (!gridRef.current) return;

    const updateLayout = () => {
      const width = gridRef.current?.clientWidth || 0;
      if (width < 480) {
        setGridLayout("compact");
      } else if (width < 768) {
        setGridLayout("regular");
      } else {
        setGridLayout("expanded");
      }
    };

    // Initialize
    updateLayout();

    // Add resize observer
    const resizeObserver = new ResizeObserver(updateLayout);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        resizeObserver.unobserve(gridRef.current);
      }
    };
  }, []);

  // Process and sort styles by importance
  const processedStyles = useMemo(() => {
    // Calculate importance for each style
    const withImportance = styles.map(style => ({
      style,
      importance: calculateImportance(style),
      // Additional metadata for grid placement
      isFeatured: style.tags?.includes("featured") || false,
      isPremium: style.tags?.includes("premium") || false,
      isHighlighted: highlightedCategories.length > 0 &&
        style.tags?.some(tag => highlightedCategories.includes(tag))
    }));
    
    // Sort by importance (highest first)
    return withImportance.sort((a, b) => b.importance - a.importance);
  }, [styles, highlightedCategories]);
  
  // Store a flat array of all style items for keyboard navigation
  const allStyleItems = useMemo(() => {
    return processedStyles.map(item => item.style.id);
  }, [processedStyles]);
  
  // Separate featured items for top row placement
  const { featuredItems, regularItems } = useMemo(() => {
    const featured = processedStyles.filter(item => item.isFeatured);
    const regular = processedStyles.filter(item => !item.isFeatured);
    return { featuredItems: featured, regularItems: regular };
  }, [processedStyles]);
  
  // Enable/disable virtualization based on item count
  useEffect(() => {
    setUseVirtualization(regularItems.length > maxItemsBeforeVirtualization);
  }, [regularItems.length, maxItemsBeforeVirtualization]);

  // Determine grid layout properties based on current layout mode
  const gridProps = useMemo(() => {
    let columns: number;
    let featuredSection: string;
    
    switch (gridLayout) {
      case "compact":
        columns = 2;
        featuredSection = "1 / -1"; // Span all columns
        break;
      case "regular":
        columns = 3;
        featuredSection = "1 / span 2"; // Span 2 columns
        break;
      case "expanded":
        columns = 4;
        featuredSection = "1 / span 2"; // Span 2 columns
        break;
      default:
        columns = 3;
        featuredSection = "1 / span 2";
    }
    
    return { columns, featuredSection };
  }, [gridLayout]);
  
  // Filter items by search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return regularItems;
    
    const term = searchTerm.toLowerCase();
    return regularItems.filter(item => {
      const { style } = item;
      // Search by name, description, and tags
      return style.name.toLowerCase().includes(term) || 
        (style.description && style.description.toLowerCase().includes(term)) ||
        (style.tags && style.tags.some(tag => tag.toLowerCase().includes(term)));
    });
  }, [regularItems, searchTerm]);
  
  // Paginate filtered items
  const paginatedItems = useMemo(() => {
    if (!searchTerm && !useVirtualization) return filteredItems;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage, searchTerm, useVirtualization]);
  
  // Total pages for pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / itemsPerPage);
  }, [filteredItems.length, itemsPerPage]);
  
  // Generate ARIA label for grid items
  const getItemAriaLabel = useCallback((item: any) => {
    const { style, isPremium, isHighlighted } = item;
    let label = `${style.name}`;
    
    if (style.description) {
      label += `. ${style.description}`;
    }
    
    if (isPremium) {
      label += `. Premium style.`;
    }
    
    if (isHighlighted) {
      label += `. Highlighted.`;
    }
    
    if (selectedStyleId === style.id) {
      label += `. Selected.`;
    }
    
    return label;
  }, [selectedStyleId]);

  // Create memoized item data for the virtualized grid
  const createItemData = memoize((
    items, 
    columnCount, 
    onSelect, 
    selectedId, 
    gridLayout, 
    focusedIndex, 
    isKeyboardNavigation,
    onFocus,
    getItemAriaLabel
  ) => ({
    items,
    columnCount,
    onSelect,
    selectedId,
    gridLayout,
    focusedIndex,
    isKeyboardNavigation,
    onFocus,
    getItemAriaLabel
  }));

  // Create item data for virtualized grid
  const itemData = useMemo(() => 
    createItemData(
      filteredItems,
      gridProps.columns,
      onStyleSelect,
      selectedStyleId,
      gridLayout,
      focusedIndex,
      isKeyboardNavigation,
      (index: number) => {
        setFocusedIndex(index);
        setIsKeyboardNavigation(false);
      },
      getItemAriaLabel
    ), 
  [filteredItems, gridProps.columns, onStyleSelect, selectedStyleId, gridLayout, focusedIndex, isKeyboardNavigation, getItemAriaLabel]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      return;
    }

    e.preventDefault();
    setIsKeyboardNavigation(true);
    
    const { columns } = gridProps;
    const itemCount = filteredItems.length;
    
    if (itemCount === 0) return;
    
    // If no item is focused yet, focus the first one
    if (focusedIndex === -1) {
      setFocusedIndex(0);
      const firstItem = filteredItems[0];
      if (firstItem) {
        setAnnouncement(`Focused on ${firstItem.style.name}. ${firstItem.style.description || ''}`);
      }
      return;
    }

    let newIndex = focusedIndex;
    
    // Handle navigation
    switch (e.key) {
      case 'ArrowUp':
        newIndex = Math.max(0, focusedIndex - columns);
        break;
      case 'ArrowDown':
        newIndex = Math.min(itemCount - 1, focusedIndex + columns);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(0, focusedIndex - 1);
        break;
      case 'ArrowRight':
        newIndex = Math.min(itemCount - 1, focusedIndex + 1);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = itemCount - 1;
        break;
    }
    
    if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < itemCount) {
      setFocusedIndex(newIndex);
      
      // Ensure the focused item is visible in virtualized list
      if (useVirtualization && gridRef.current) {
        // TODO: Add scrolling logic for virtualized grid if needed
      }
      
      // Announce the newly focused item for screen readers
      const focusedItem = filteredItems[newIndex];
      if (focusedItem) {
        setAnnouncement(`Focused on ${focusedItem.style.name}. ${focusedItem.style.description || ''}`);
      }
    }
  }, [focusedIndex, filteredItems, gridProps, useVirtualization]);
  
  // Handle selection of the currently focused item
  const selectFocusedItem = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
      const item = filteredItems[focusedIndex];
      onStyleSelect(item.style.id);
      setAnnouncement(`Selected style: ${item.style.name}`);
    }
  }, [focusedIndex, filteredItems, onStyleSelect]);
  
  // Add keyboard listener for Enter/Space to select the focused item
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === gridContainerRef.current) {
        e.preventDefault();
        selectFocusedItem();
      }
    };
    
    document.addEventListener('keydown', handleKeyPress as any);
    return () => {
      document.removeEventListener('keydown', handleKeyPress as any);
    };
  }, [selectFocusedItem]);
  
  // Determine grid positioning for an item based on its importance
  const getGridPosition = (index: number, importance: number, isPremium: boolean, isFeatured: boolean) => {
    // For very small screens, don't apply complex positioning
    if (gridLayout === "compact" && !isFeatured) {
      return {};
    }
    
    const { columns } = gridProps;
    
    // Premium items get special treatment
    if (isPremium) {
      // In expanded layouts, premium items span 2x2
      if (gridLayout !== "compact") {
        return {
          gridColumn: `span 2`,
          gridRow: `span 2`
        };
      }
      // In compact layout, they just span full width
      return {
        gridColumn: "1 / -1"
      };
    }
    
    // High importance non-premium items might span columns in certain positions
    if (importance > 25 && !isPremium && index < 5) {
      if (gridLayout !== "compact") {
        const column = (index % columns) + 1;
        if (column < columns) { // Don't span if it would overflow the grid
          return {
            gridColumn: `${column} / span 2`
          };
        }
      }
    }
    
    return {};
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  // Categorize non-featured styles
  const categorizedStyles = useMemo(() => {
    return regularItems.reduce<Record<string, typeof regularItems>>((acc, item) => {
      const category = item.style.tags?.[0] || "other";
      acc[category] = [...(acc[category] || []), item];
      return acc;
    }, {});
  }, [regularItems]);
  
  // Handle search input changes with debounce
  const handleSearchChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // Reset to first page on search
    }, 300),
    []
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset focused item when changing pages
    setFocusedIndex(-1);
  };

  // Exit keyboard navigation mode when user clicks or touches
  useEffect(() => {
    const handleMouseMove = () => {
      if (isKeyboardNavigation) {
        setIsKeyboardNavigation(false);
      }
    };
    
    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gridElement = document.getElementById('style-grid');
    if (gridElement && prefersReducedMotion) {
      gridElement.style.setProperty('--transition-duration', '0.1s');
      gridElement.style.setProperty('--animation-duration', '0.1s');
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleMouseMove);
    };
  }, [isKeyboardNavigation]);

  return (
    <div className="space-y-4">
      {/* Search input with label */}
      <div className="relative">
        <label htmlFor="style-search" className="sr-only">Search styles</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="style-search"
            type="search"
            placeholder="Search styles..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for styles by name or description"
          />
        </div>
      </div>
      
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      
      {/* Status for screen readers */}
      <div className="sr-only">
        {filteredItems.length === 0 
          ? "No styles found matching your search." 
          : `${filteredItems.length} styles available. ${selectedStyleId ? "One style selected." : "No style selected."}`
        }
        {useVirtualization && "Use arrow keys to navigate through styles."}
      </div>

      {/* Grid container with keyboard navigation */}
      <div 
        ref={gridContainerRef}
        className="outline-none relative"
        tabIndex={0}
        role="grid"
        aria-label="Style selection grid"
        aria-rowcount={Math.ceil(filteredItems.length / gridProps.columns)}
        aria-colcount={gridProps.columns}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (focusedIndex === -1 && filteredItems.length > 0) {
            setFocusedIndex(0);
          }
        }}
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="w-6 h-6 mx-auto mb-2" />
            <p>No styles found matching your search</p>
          </div>
        ) : useVirtualization ? (
          // Virtualized grid for many items
          <div ref={gridRef} className="h-[600px] w-full">
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeGrid
                  columnCount={gridProps.columns}
                  columnWidth={width / gridProps.columns}
                  height={height}
                  rowCount={Math.ceil(filteredItems.length / gridProps.columns)}
                  rowHeight={240} // Adjust based on your card size
                  width={width}
                  itemData={itemData}
                  overscanRowCount={2}
                >
                  {MemoizedGridItem}
                </FixedSizeGrid>
              )}
            </AutoSizer>
          </div>
        ) : (
          // Standard grid for fewer items
          <div
            ref={gridRef}
            className={cn(
              "grid gap-3",
              gridLayout === "compact" ? "grid-cols-2" : 
              gridLayout === "regular" ? "grid-cols-3" : 
              "grid-cols-4"
            )}
          >
            {paginatedItems.map((item, index) => {
              const { style, importance, isPremium, isHighlighted } = item;
              const isFocused = index === focusedIndex && isKeyboardNavigation;
              
              return (
                <div 
                  key={style.id}
                  className={cn(
                    "transform transition-all",
                    isHighlighted && "scale-105 z-10",
                    isFocused && "z-10 ring-2 ring-primary ring-offset-2"
                  )}
                  onFocus={() => setFocusedIndex(index)}
                  role="gridcell"
                >
                  <StyleCard
                    style={style}
                    isSelected={selectedStyleId === style.id}
                    onSelect={onStyleSelect}
                    size={isPremium && gridLayout !== "compact" ? "large" : "regular"}
                    highlighted={isHighlighted || isFocused}
                    ariaLabel={getItemAriaLabel(item)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Pagination with accessibility labels */}
      {searchTerm && !useVirtualization && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          {/* Simple pagination controls with proper aria labels */}
          <div className="flex items-center gap-2" role="navigation" aria-label="Style grid pagination">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
              aria-label="Previous page of styles"
            >
              Previous
            </button>
            
            <span className="mx-2">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
              aria-label="Next page of styles"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 