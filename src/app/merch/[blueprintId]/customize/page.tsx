'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getPrintifyBlueprintDetails, PrintifyBlueprintDetails, PrintifyVariant } from '@/lib/printify/client';
import { getPetPortraits } from '@/lib/supabase/queries';
import { Loader2, AlertCircle, Move, ZoomIn, ZoomOut, RotateCw, Check, ArrowLeft } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { useToast } from "@/components/ui/use-toast";

interface Portrait {
  id: string;
  url: string;
  name: string;
  created_at: string;
}

export default function CustomizeMerchPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const variantId = searchParams.get('variant');
    const blueprintId = Number(params.blueprintId);
    const addToCart = useCartStore(state => state.addItem);
    const { toast } = useToast();

    const [details, setDetails] = useState<PrintifyBlueprintDetails | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<PrintifyVariant | null>(null);
    const [portraits, setPortraits] = useState<Portrait[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPortrait, setSelectedPortrait] = useState<Portrait | null>(null);
    
    // Customization states
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Load product details and user's portraits
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch product details
                if (blueprintId && !isNaN(blueprintId)) {
                    const productData = await getPrintifyBlueprintDetails(blueprintId);
                    if (!productData) {
                        throw new Error('Product not found.');
                    }
                    setDetails(productData);
                    
                    // Find the selected variant if variantId is provided
                    if (variantId) {
                        const variant = productData.variants.find(v => v.id === Number(variantId));
                        if (variant) {
                            setSelectedVariant(variant);
                        } else {
                            // If variant not found, default to first one
                            setSelectedVariant(productData.variants[0] || null);
                        }
                    } else {
                        // Default to first variant
                        setSelectedVariant(productData.variants[0] || null);
                    }
                } else {
                    throw new Error('Invalid product ID.');
                }
                
                // Fetch user's pet portraits
                const portraitsData = await getPetPortraits();
                setPortraits(portraitsData || []);
                
                // Select first portrait by default if available
                if (portraitsData && portraitsData.length > 0) {
                    setSelectedPortrait(portraitsData[0]);
                }
                
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load data.';
                setError(errorMessage);
                console.error("Error loading customization data:", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [blueprintId, variantId]);

    // Handle mouse/touch events for dragging
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };
    
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({ 
                x: e.touches[0].clientX - position.x, 
                y: e.touches[0].clientY - position.y 
            });
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };
    
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isDragging && e.touches.length === 1) {
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    // Add touch end handler
    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const resetPosition = () => {
        setPosition({ x: 0, y: 0 });
        setScale(1);
        setRotation(0);
    };

    // Handle rotation change
    const handleRotation = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleAddToCart = () => {
        if (!details || !selectedVariant || !selectedPortrait) return;
        
        // Create customized item
        const customizationOptions = {
            portraitId: selectedPortrait.id,
            portraitUrl: selectedPortrait.url,
            scale,
            position,
            rotation
        };
        
        // Add to cart
        addToCart({
            id: `${details.id}-${selectedVariant.id}-${Date.now()}`,
            blueprintId: details.id,
            variantId: selectedVariant.id,
            title: details.title,
            image: details.images[0],
            price: selectedVariant.price / 100, // Convert cents to dollars
            options: selectedVariant.options,
            customization: customizationOptions,
            quantity: 1
        });
        
        // Show success toast
        toast({
            title: "Added to cart!",
            description: `${details.title} with your pet portrait has been added to your cart.`,
            duration: 3000,
        });
        
        // Navigate to cart or continue shopping
        router.push('/checkout');
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        // Convert cents to dollars
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading customization tools...</span>
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
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => router.back()}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (portraits.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <p className="text-lg mb-4">You don't have any portraits to use for customization.</p>
                    <Button onClick={() => router.push('/pets/upload')}>
                        Create a Pet Portrait First
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to product
            </Button>
            
            <h1 className="text-3xl font-bold mb-6">Customize Your {details.title}</h1>
            
            <div className="grid md:grid-cols-[1fr_350px] gap-8">
                {/* Preview Area */}
                <div className="bg-accent/5 rounded-lg p-4 relative">
                    <div 
                        className="relative w-full h-[500px] max-w-[600px] mx-auto overflow-hidden"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    >
                        {/* Product Background */}
                        <Image
                            src={details.images[0]}
                            alt={details.title}
                            fill
                            className="object-contain"
                            priority
                        />
                        
                        {/* Placement Area */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Draggable Pet Portrait */}
                            {selectedPortrait && (
                                <div 
                                    className="absolute"
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                                        transformOrigin: 'center',
                                        width: '200px',
                                        height: '200px',
                                    }}
                                >
                                    <Image
                                        src={selectedPortrait.url}
                                        alt={selectedPortrait.name || "Pet portrait"}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-center mt-4 gap-2">
                        <Button variant="secondary" size="sm" onClick={resetPosition}>
                            Reset
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleRotation}>
                            <RotateCw className="h-4 w-4 mr-1" /> Rotate
                        </Button>
                    </div>
                </div>
                
                {/* Controls Column */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Customization Options</h2>
                        
                        {/* Size Control */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <Label>Size</Label>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => setScale(s => Math.min(2, s + 0.1))}
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Slider
                                value={[scale * 100]}
                                min={50}
                                max={200}
                                step={5}
                                onValueChange={(values) => setScale(values[0] / 100)}
                            />
                        </div>
                        
                        <Separator className="my-6" />
                        
                        {/* Portrait Selection */}
                        <div>
                            <Label className="mb-2 block">Select Portrait</Label>
                            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                                {portraits.map(portrait => (
                                    <div
                                        key={portrait.id}
                                        className={cn(
                                            "relative border rounded-md overflow-hidden cursor-pointer transition-all",
                                            selectedPortrait?.id === portrait.id 
                                                ? "ring-2 ring-primary" 
                                                : "hover:opacity-80"
                                        )}
                                        onClick={() => setSelectedPortrait(portrait)}
                                    >
                                        <AspectRatio ratio={1}>
                                            <Image
                                                src={portrait.url}
                                                alt={portrait.name || "Pet portrait"}
                                                fill
                                                className="object-cover"
                                            />
                                        </AspectRatio>
                                        {selectedPortrait?.id === portrait.id && (
                                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <Separator className="my-6" />
                        
                        {/* Product Info & Add to Cart */}
                        <div className="bg-muted/20 p-4 rounded-lg">
                            <h3 className="font-semibold">Product Summary</h3>
                            <p className="text-sm text-muted-foreground mb-2">{details.title}</p>
                            
                            {selectedVariant && (
                                <div className="text-sm mb-4">
                                    {Object.entries(selectedVariant.options).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="capitalize">{key}:</span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-4">
                                <p className="font-bold text-lg">
                                    {selectedVariant ? formatCurrency(selectedVariant.price) : 'N/A'}
                                </p>
                                <Button onClick={handleAddToCart} disabled={!selectedVariant || !selectedPortrait}>
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 