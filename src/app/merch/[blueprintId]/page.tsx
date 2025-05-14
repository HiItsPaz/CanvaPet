'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getPrintifyBlueprintDetails, getPrintifyBlueprints, PrintifyBlueprintDetails, PrintifyVariant, PrintifyBlueprint } from '@/lib/printify/client';
import { Loader2, AlertCircle, Paintbrush, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { cn } from '@/lib/utils';

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
    const router = useRouter();
    const blueprintId = Number(params.blueprintId);
    const { toast } = useToast();
    const addToCart = useCartStore(state => state.addItem);

    const [details, setDetails] = useState<PrintifyBlueprintDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [selectedVariant, setSelectedVariant] = useState<PrintifyVariant | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<PrintifyBlueprint[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [activeTab, setActiveTab] = useState("details");

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

                    // Fetch related products
                    fetchRelatedProducts(data);

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

    // Fetch related products based on product category/tags
    const fetchRelatedProducts = async (currentProduct: PrintifyBlueprintDetails) => {
        setLoadingRelated(true);
        try {
            const allProducts = await getPrintifyBlueprints();
            
            // Filter out current product and limit to 6 items
            // In a real app, you'd use more sophisticated matching by category/tags
            const filtered = allProducts
                .filter(product => 
                    product.id !== currentProduct.id && 
                    product.title.split(' ')[0] === currentProduct.title.split(' ')[0] // Simple category matching
                )
                .slice(0, 6);
            
            // If we don't have enough related products, just show some random ones
            if (filtered.length < 4) {
                const randomProducts = allProducts
                    .filter(product => product.id !== currentProduct.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 6 - filtered.length);
                
                setRelatedProducts([...filtered, ...randomProducts]);
            } else {
                setRelatedProducts(filtered);
            }
        } catch (err) {
            console.error("Error fetching related products:", err);
            // Don't show error to user, just leave related products empty
        } finally {
            setLoadingRelated(false);
        }
    };

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

    // Handle thumbnail click to change main image
    const handleThumbnailClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    const handleQuantityChange = (value: number) => {
        setQuantity(Math.max(1, Math.min(99, value)));
    };

    const handleAddToCart = () => {
        if (!selectedVariant) return;
        
        // Add to cart without customization
        addToCart({
            id: `${details!.id}-${selectedVariant.id}-${Date.now()}`,
            blueprintId: details!.id,
            variantId: selectedVariant.id,
            title: details!.title,
            image: details!.images[0],
            price: selectedVariant.price / 100, // Convert cents to dollars
            options: selectedVariant.options,
            customization: {
                portraitId: "", // Empty for non-customized items
                portraitUrl: "",
                scale: 1,
                position: { x: 0, y: 0 },
                rotation: 0
            },
            quantity: quantity
        });
        
        toast({
            title: "Added to cart!",
            description: `${quantity} × ${details!.title} added to your cart.`,
            duration: 3000,
        });
    };

    const handleCustomizeClick = () => {
        if (selectedVariant) {
            router.push(`/merch/${blueprintId}/customize?variant=${selectedVariant.id}`);
        }
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
                    <Button 
                        onClick={() => router.back()}
                        variant="outline"
                        className="mt-4"
                    >
                        Back to Products
                    </Button>
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
                <div className="space-y-4">
                     <AspectRatio ratio={1 / 1} className="bg-muted rounded-lg overflow-hidden">
                         <Image
                             src={details.images[currentImageIndex]} 
                             alt={details.title}
                             fill
                             className="object-contain p-4"
                             priority
                         />
                     </AspectRatio>
                     
                     {/* Thumbnails for multiple images */}
                     {details.images.length > 1 && (
                         <div className="flex gap-2 overflow-x-auto py-2">
                             {details.images.map((img, idx) => (
                                 <div 
                                     key={idx} 
                                     className={`relative w-16 h-16 rounded border cursor-pointer transition-all ${currentImageIndex === idx ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'}`}
                                     onClick={() => handleThumbnailClick(idx)}
                                 >
                                     <Image
                                         src={img}
                                         alt={`${details.title} view ${idx + 1}`}
                                         fill
                                         className="object-cover"
                                     />
                                 </div>
                             ))}
                         </div>
                     )}
                </div>

                {/* Details Column */}
                <div className="space-y-6">
                    <div>
                        {details.brand && (
                            <Badge variant="outline" className="mb-2">
                                {details.brand}
                            </Badge>
                        )}
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">{details.title}</h1>
                        <p className="text-lg text-muted-foreground mb-4">
                            {selectedVariant 
                                ? formatCurrency(selectedVariant.price)
                                : (details.variants.length > 0 
                                    ? `From ${formatCurrency(Math.min(...details.variants.map(v => v.price || 0)))}`
                                    : 'Price unavailable')
                            }
                        </p>
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
                        
                        {/* Quantity Selection */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="col-span-1 text-sm font-medium">Quantity</Label>
                            <div className="flex items-center col-span-3">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-r-none"
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    className="h-10 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-l-none"
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={quantity >= 99}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        {/* Add to Cart Button */}
                        <Button 
                            size="lg" 
                            className="w-full" 
                            onClick={handleAddToCart}
                            disabled={!selectedVariant}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                        </Button>
                        
                        {/* Customize Button */}
                        <Button 
                            size="lg" 
                            className="w-full" 
                            variant="outline"
                            onClick={handleCustomizeClick} 
                            disabled={!selectedVariant}
                        >
                            <Paintbrush className="mr-2 h-4 w-4" />
                            Customize with Pet Portrait
                        </Button>
                        
                        <p className="text-sm text-muted-foreground text-center">
                            Choose a pet portrait and customize placement in the next step
                        </p>
                        
                        {!selectedVariant && Object.keys(selectedOptions).length > 0 && (
                            <p className="text-sm text-destructive text-center">
                                Selected combination is unavailable. Please choose different options.
                            </p>
                        )}
                    </div>
                    
                    {/* Product Information Tabs */}
                    <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="shipping">Shipping</TabsTrigger>
                            <TabsTrigger value="returns">Returns</TabsTrigger>
                        </TabsList>
                        
                        <div className="mt-4 px-1">
                            {activeTab === "details" && (
                                <div className="space-y-2">
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>High-quality customizable merchandise</li>
                                        <li>Printed on demand using {details.brand || 'premium'} materials</li>
                                        <li>Add your favorite pet portrait for a personal touch</li>
                                        {details.description && details.description.split('.').map((sentence, idx) => 
                                            sentence.trim() ? <li key={`desc-${idx}`}>{sentence.trim()}</li> : null
                                        )}
                                        {Object.entries(selectedVariant?.options || {}).map(([key, value]) => (
                                            <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {activeTab === "shipping" && (
                                <div className="space-y-2 text-sm">
                                    <p>Ships in 3-5 business days after customization</p>
                                    <p>Free shipping on orders over $50</p>
                                    <p>Standard shipping: $4.99</p>
                                    <p>Express shipping: $12.99 (2-3 business days)</p>
                                </div>
                            )}
                            
                            {activeTab === "returns" && (
                                <div className="space-y-2 text-sm">
                                    <p>Due to the customized nature of these products, we cannot accept returns unless there is a manufacturing defect.</p>
                                    <p>If you received a damaged or defective item, please contact us within 14 days of delivery.</p>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>
            </div>
            
            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">You May Also Like</h2>
                        <Button variant="link" asChild>
                            <Link href="/merch" className="flex items-center">
                                View All <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {relatedProducts.map((product) => (
                            <Link key={product.id} href={`/merch/${product.id}`} className="group">
                                <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                                    <CardContent className="p-0">
                                        <AspectRatio ratio={1/1} className="bg-muted">
                                            <Image
                                                src={product.images[0]}
                                                alt={product.title}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                        </AspectRatio>
                                        <div className="p-3">
                                            <h3 className="font-medium text-sm truncate">{product.title}</h3>
                                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 