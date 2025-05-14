'use client';

import { useState } from 'react';
import { MerchBrowser } from "@/components/merch/MerchBrowser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, Maximize, Minimize, SlidersHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Dummy categories - should come from API or config in production
const CATEGORIES = [
    { id: 'all', name: 'All Products' },
    { id: 'apparel', name: 'Apparel' },
    { id: 'home', name: 'Home Goods' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'wall-art', name: 'Wall Art' }
];

type GridDensity = 'compact' | 'normal' | 'comfortable';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';

interface FilterOptions {
    priceRange: [number, number];
    availability: boolean;
    brands: string[];
}

export default function MerchPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [gridDensity, setGridDensity] = useState<GridDensity>('normal');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filters, setFilters] = useState<FilterOptions>({
        priceRange: [0, 100], // In dollars
        availability: true,
        brands: []
    });

    // Handler for price range changes
    const handlePriceRangeChange = (value: number[]) => {
        setFilters(prev => ({
            ...prev,
            priceRange: [value[0], value[1]]
        }));
    };

    // Handler for availability toggle
    const handleAvailabilityChange = (checked: boolean) => {
        setFilters(prev => ({
            ...prev,
            availability: checked
        }));
    };

    // Handler for brand selection
    const handleBrandChange = (brand: string, checked: boolean) => {
        setFilters(prev => {
            if (checked) {
                return { ...prev, brands: [...prev.brands, brand] };
            } else {
                return { ...prev, brands: prev.brands.filter(b => b !== brand) };
            }
        });
    };

    // Reset all filters to default values
    const resetFilters = () => {
        setFilters({
            priceRange: [0, 100],
            availability: true,
            brands: []
        });
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-6">Choose Your Merchandise</h1>
            <p className="text-muted-foreground mb-8">
                Select an item below to customize it with your pet portrait.
            </p>
            
            {/* Controls Row */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                {/* Category Tabs */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto overflow-x-auto">
                    <TabsList className="w-full sm:w-auto">
                        {CATEGORIES.map(category => (
                            <TabsTrigger key={category.id} value={category.id}>
                                {category.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Filters Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filters</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Filter Products</SheetTitle>
                                <SheetDescription>
                                    Narrow down your merchandise options
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                {/* Price Range Filter */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="price-range" className="text-base">Price Range</Label>
                                        <span className="text-sm text-muted-foreground">
                                            ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                        </span>
                                    </div>
                                    <Slider
                                        id="price-range"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={filters.priceRange}
                                        onValueChange={handlePriceRangeChange}
                                        className="mt-2"
                                    />
                                </div>
                                
                                <Separator />
                                
                                {/* Availability Filter */}
                                <div className="space-y-4">
                                    <Label className="text-base">Availability</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="in-stock" 
                                            checked={filters.availability}
                                            onCheckedChange={handleAvailabilityChange}
                                        />
                                        <label
                                            htmlFor="in-stock"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            In Stock Only
                                        </label>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                {/* Brands Filter */}
                                <div className="space-y-4">
                                    <Label className="text-base">Brands</Label>
                                    <div className="grid gap-2">
                                        {['Printify', 'Canva', 'Printful', 'CustomInk'].map(brand => (
                                            <div key={brand} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`brand-${brand}`} 
                                                    checked={filters.brands.includes(brand)}
                                                    onCheckedChange={(checked) => 
                                                        handleBrandChange(brand, checked as boolean)
                                                    }
                                                />
                                                <label
                                                    htmlFor={`brand-${brand}`}
                                                    className="text-sm font-medium leading-none"
                                                >
                                                    {brand}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                {/* Reset & Apply Buttons */}
                                <div className="flex justify-between">
                                    <Button variant="ghost" onClick={resetFilters}>Reset</Button>
                                    <Button>Apply Filters</Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="popularity">Popularity</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {/* Grid Density Control */}
                    <Select value={gridDensity} onValueChange={(value) => setGridDensity(value as GridDensity)}>
                        <SelectTrigger className="w-[150px]">
                            <Grid className="h-4 w-4 mr-2" /> <SelectValue placeholder="Grid Density" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="compact">
                                <div className="flex items-center">
                                    <Minimize className="h-4 w-4 mr-2" />
                                    <span>Compact</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="normal">
                                <div className="flex items-center">
                                    <Grid className="h-4 w-4 mr-2" />
                                    <span>Normal</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="comfortable">
                                <div className="flex items-center">
                                    <Maximize className="h-4 w-4 mr-2" />
                                    <span>Comfortable</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            {/* Active Filters Display */}
            <div className="mb-6 flex flex-wrap gap-2 items-center">
                {filters.priceRange[0] > 0 || filters.priceRange[1] < 100 ? (
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                        <span>Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 ml-1" 
                            onClick={() => setFilters(prev => ({...prev, priceRange: [0, 100]}))}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove price filter</span>
                        </Button>
                    </Badge>
                ) : null}
                
                {filters.brands.map(brand => (
                    <Badge key={brand} variant="outline" className="gap-1 px-3 py-1">
                        <span>Brand: {brand}</span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 ml-1" 
                            onClick={() => handleBrandChange(brand, false)}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {brand} filter</span>
                        </Button>
                    </Badge>
                ))}
                
                {!filters.availability && (
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                        <span>Include out of stock</span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 ml-1" 
                            onClick={() => setFilters(prev => ({...prev, availability: true}))}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Show only in stock</span>
                        </Button>
                    </Badge>
                )}
                
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100 || filters.brands.length > 0 || !filters.availability) && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFilters}
                        className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        Clear all
                    </Button>
                )}
            </div>
            
            <MerchBrowser 
                density={gridDensity} 
                category={selectedCategory} 
                sortBy={sortBy}
                filters={filters}
            />
        </div>
    );
} 