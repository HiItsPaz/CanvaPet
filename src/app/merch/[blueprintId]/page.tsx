'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getPrintifyBlueprintDetails, PrintifyBlueprintDetails, PrintifyVariant } from '@/lib/printify/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Helper to extract options (like color, size) from variants
function getVariantOptions(variants: PrintifyVariant[]) {
    const options: Record<string, Set<string>> = {};
    variants.forEach(variant => {
        Object.entries(variant.options).forEach(([key, value]) => {
            if (!options[key]) {
                options[key] = new Set();
            }
            options[key].add(String(value)); // Ensure value is string
        });
    });
    return Object.fromEntries(
        Object.entries(options).map(([key, valueSet]) => [key, Array.from(valueSet)])
    );
}

export default function MerchDetailPage() {
    const params = useParams();
    const blueprintId = Number(params.blueprintId);

    const [details, setDetails] = useState<PrintifyBlueprintDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<PrintifyVariant | null>(null);

    useEffect(() => {
        if (blueprintId && !isNaN(blueprintId)) {
            const fetchDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getPrintifyBlueprintDetails(blueprintId);
                    if (!data) {
                        throw new Error('Product not found.');
                    }
                    setDetails(data);
                    // Set initial default options if possible
                    const initialOptions: Record<string, string> = {};
                    if (data.variants.length > 0) {
                        Object.keys(data.variants[0].options).forEach(key => {
                            initialOptions[key] = String(data.variants[0].options[key]);
                        });
                    }
                    setSelectedOptions(initialOptions);

                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message || 'Failed to load product details.');
                    } else {
                        setError('Failed to load product details.');
                    }
                    console.error("Error fetching blueprint details:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        } else {
            setError('Invalid product ID.');
            setLoading(false);
        }
    }, [blueprintId]);

    // Effect to find the matching variant when options change
    useEffect(() => {
        if (!details || Object.keys(selectedOptions).length === 0) {
            setSelectedVariant(null);
            return;
        }
        
        const variant = details.variants.find(v => 
            v.is_enabled && 
            Object.entries(selectedOptions).every(([key, value]) => 
                String(v.options[key]) === value
            )
        );
        setSelectedVariant(variant || null);

    }, [details, selectedOptions]);

    const handleOptionChange = (optionKey: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionKey]: value }));
    };

    const variantOptions = details ? getVariantOptions(details.variants) : {};

    if (loading) {
        return (
             <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        );
    }

    if (error || !details) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-lg font-semibold">Error</p>
                    <p className="text-sm">{error || 'Could not load product details.'}</p>
                    {/* Link back to merch page? */}
                </div>
            </div>
        );
    }
    
    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        // Assuming amount is in cents
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Column */}
                <div>
                     <AspectRatio ratio={1 / 1} className="bg-muted rounded-lg overflow-hidden">
                         <Image
                             src={details.images[0]} // Show first image by default
                             alt={details.title}
                             fill
                             className="object-contain p-4"
                             priority // Prioritize loading main product image
                         />
                     </AspectRatio>
                     {/* Add carousel for multiple images later if needed */}
                </div>

                {/* Details Column */}
                <div className="space-y-6">
                    <div>
                         <h1 className="text-3xl lg:text-4xl font-bold mb-2">{details.title}</h1>
                         <p className="text-lg text-muted-foreground mb-4">By {details.brand}</p>
                         <p className="text-sm leading-relaxed">{details.description}</p>
                    </div>

                    <Separator />

                    {/* Variant Selection */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Options</h2>
                        {Object.entries(variantOptions).map(([key, values]) => (
                            <div key={key} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`select-${key}`} className="capitalize col-span-1 text-sm font-medium">{key}</Label>
                                <Select 
                                    value={selectedOptions[key]}
                                    onValueChange={(value) => handleOptionChange(key, value)}
                                >
                                    <SelectTrigger id={`select-${key}`} className="col-span-3">
                                        <SelectValue placeholder={`Select ${key}...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {values.map(value => (
                                            <SelectItem key={value} value={value}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                     <Separator />

                    {/* Price and Add to Cart */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                         <p className="text-2xl font-bold">
                             {selectedVariant 
                                ? formatCurrency(selectedVariant.price)
                                : (details.variants.length > 0 
                                    ? `${formatCurrency(details.variants[0].price)}+`
                                    : 'Price unavailable')
                             }
                         </p>
                         <Button size="lg" disabled={!selectedVariant}>
                             {selectedVariant ? 'Add to Cart' : 'Select Options'}
                         </Button>
                    </div>
                     {!selectedVariant && Object.keys(selectedOptions).length > 0 && (
                         <p className="text-sm text-destructive">Selected combination is unavailable.</p>
                     )}
                     {/* Add image placement preview / customization link here */}
                     <div className="mt-6 pt-6 border-t">
                         <h3 className="text-lg font-semibold mb-2">Customize with your Portrait</h3>
                         <p className="text-sm text-muted-foreground mb-4">You&apos;ll add your pet portrait to this item in the next step.</p>
                         {/* Link/Button to proceed to customization step */}
                     </div>
                </div>
            </div>
        </div>
    );
} 