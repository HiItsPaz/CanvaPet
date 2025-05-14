'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPrintifyBlueprints, PrintifyBlueprint } from '@/lib/printify/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ShoppingCart, Info, Tag } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

type GridDensity = 'compact' | 'normal' | 'comfortable';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';

interface FilterOptions {
    priceRange: [number, number];
    availability: boolean;
    brands: string[];
}

interface MerchBrowserProps {
  density?: GridDensity;
  category?: string;
  sortBy?: SortOption;
  filters?: FilterOptions;
}

// This should be determined from the API or config in a real app
const categoryMap: Record<string, string[]> = {
  'apparel': ['T-Shirt', 'Hoodie', 'Sweatshirt'],
  'home': ['Mug', 'Pillow', 'Canvas'],
  'accessories': ['Phone Case', 'Tote Bag'],
  'wall-art': ['Poster', 'Canvas', 'Framed Print']
};

// Dummy price data (since we don't have real pricing from the API)
const getDummyPrice = (bp: PrintifyBlueprint): number => {
    // Generate a pseudo-random price based on blueprint ID
    // In a real app, this would come from the API
    return 15 + (bp.id % 10) * 5;
};

export function MerchBrowser({ 
    density = 'normal', 
    category = 'all',
    sortBy = 'newest',
    filters = {
        priceRange: [0, 100],
        availability: true,
        brands: []
    }
}: MerchBrowserProps) {
    const [blueprints, setBlueprints] = useState<PrintifyBlueprint[]>([]);
    const [filteredBlueprints, setFilteredBlueprints] = useState<PrintifyBlueprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const fetchBlueprints = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getPrintifyBlueprints();
                setBlueprints(data || []); 
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load products.';
                setError(errorMessage);
                console.error("Error fetching blueprints:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlueprints();
    }, []);

    // Apply all filters and sorting
    useEffect(() => {
        // Start with all blueprints
        let filtered = [...blueprints];
        
        // Category filter
        if (category !== 'all') {
            const categoryKeywords = categoryMap[category] || [];
            filtered = filtered.filter(bp => {
                const text = `${bp.title} ${bp.description} ${bp.brand}`.toLowerCase();
                return categoryKeywords.some(keyword => 
                    text.includes(keyword.toLowerCase())
                );
            });
        }
        
        // Price range filter
        filtered = filtered.filter(bp => {
            const price = getDummyPrice(bp);
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
        
        // Availability filter (we'll simulate this with even/odd IDs)
        if (filters.availability) {
            filtered = filtered.filter(bp => bp.id % 2 === 0); // Even IDs are "in stock"
        }
        
        // Brand filter
        if (filters.brands.length > 0) {
            filtered = filtered.filter(bp => 
                filters.brands.includes(bp.brand)
            );
        }
        
        // Sort results
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return getDummyPrice(a) - getDummyPrice(b);
                case 'price-desc':
                    return getDummyPrice(b) - getDummyPrice(a);
                case 'popularity':
                    // Simulate popularity with view count based on ID
                    return (b.id * 10) - (a.id * 10);
                case 'newest':
                default:
                    // Newest determined by ID in reverse (higher ID = newer)
                    return b.id - a.id;
            }
        });
        
        setFilteredBlueprints(filtered);
    }, [category, filters, sortBy, blueprints]);

    // Reset cardRefs when filtered blueprints change
    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, filteredBlueprints.length);
    }, [filteredBlueprints]);

    // Get grid columns based on density and screen size
    const getGridClasses = (): string => {
        let baseClasses = "grid gap-4 sm:gap-6 transition-all duration-300";
        
        // Determine column classes based on density
        switch (density) {
            case 'compact':
                return cn(
                    baseClasses,
                    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                );
            case 'comfortable':
                return cn(
                    baseClasses,
                    "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                );
            case 'normal':
            default:
                return cn(
                    baseClasses,
                    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const bp = filteredBlueprints[index];
            if (bp) {
                // Navigate programmatically
                window.location.href = `/merch/${bp.id}`;
            }
        }
    };

    // Helper to determine if product should show "new" badge
    // In production, this would use actual data like date added
    const isNewProduct = (bp: PrintifyBlueprint): boolean => {
        // Simple example: show badge on ~30% of products
        // In reality, this might check if product was added in last 30 days
        return bp.id % 3 === 0;
    };

    // Helper to show "out of stock" status
    const isInStock = (bp: PrintifyBlueprint): boolean => {
        // Simulating stock status with even IDs
        return bp.id % 2 === 0;
    };

    // Helper to get price for a blueprint
    const getPrice = (bp: PrintifyBlueprint): number => {
        return getDummyPrice(bp);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]" aria-live="polite" aria-busy="true">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading products...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive" aria-live="polite">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>Error loading products:</p>
                <p className="text-sm">{error}</p>
                <Button 
                    onClick={() => window.location.reload()} 
                    variant="destructive" 
                    className="mt-4"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    if (filteredBlueprints.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12" aria-live="polite">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
                <p className="text-center text-muted-foreground">
                    {blueprints.length === 0 
                        ? "No merchandise options currently available." 
                        : "No products match your selected filters."}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-0 animate-fadeIn">
            <div
                className={getGridClasses()}
                role="grid"
                aria-label="Merchandise products grid"
            >
                {filteredBlueprints.map((bp, index) => (
                    <div 
                        key={bp.id}
                        ref={(el) => { cardRefs.current[index] = el; }}
                        className={cn(
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            "transition-all duration-300 transform animate-fadeIn",
                        )}
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        style={{ animationDelay: `${index * 30}ms` }}
                        onMouseEnter={() => setHoveredId(bp.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onFocus={() => setHoveredId(bp.id)}
                        onBlur={() => setHoveredId(null)}
                        aria-label={`${bp.title} by ${bp.brand}`}
                        role="gridcell"
                    >
                        <Card className={cn(
                            "overflow-hidden group relative h-full",
                            "focus-within:ring-2 focus-within:ring-primary", 
                            "transition-all duration-300",
                            "hover:shadow-md hover:translate-y-[-2px]",
                        )}>
                            <CardContent className="p-0">
                                <div className="relative w-full overflow-hidden">
                                    <AspectRatio ratio={1 / 1}>
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-0",
                                            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                            hoveredId === bp.id ? 'opacity-100' : ''
                                        )} />
                                        <Image
                                            src={bp.images[0]} // Use first image as preview
                                            alt={bp.title}
                                            fill
                                            className={cn(
                                                "object-cover w-full h-full",
                                                "transition-all duration-500",
                                                "group-hover:scale-105",
                                            )}
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                    </AspectRatio>
                                    
                                    {/* Only show New badge if product is new */}
                                    {isNewProduct(bp) && (
                                        <Badge 
                                            variant="secondary" 
                                            className="absolute top-2 left-2 z-10 bg-accent-400 hover:bg-accent-400 text-black"
                                        >
                                            New
                                        </Badge>
                                    )}
                                    
                                    {/* Show stock status */}
                                    {!isInStock(bp) && (
                                        <Badge 
                                            variant="destructive" 
                                            className="absolute top-2 right-2 z-10"
                                        >
                                            Out of Stock
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg leading-tight h-12 overflow-hidden">{bp.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1 text-sm">
                                    <Tag className="h-3 w-3" /> {bp.brand}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0 flex flex-col">
                                {/* Price from the helper function */}
                                <p className="text-sm font-semibold mb-3">${getPrice(bp).toFixed(2)}</p>
                                
                                <Link href={`/merch/${bp.id}`} className="w-full">
                                    <Button 
                                        variant="default" 
                                        className="w-full transition-all duration-300 group-hover:bg-primary-600"
                                        disabled={!isInStock(bp) && filters.availability}
                                    >
                                        {isInStock(bp) ? "View Options" : "Notify Me"}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
} 