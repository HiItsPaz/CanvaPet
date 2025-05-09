'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPrintifyBlueprints, PrintifyBlueprint } from '@/lib/printify/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function MerchBrowser() {
    const [blueprints, setBlueprints] = useState<PrintifyBlueprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlueprints = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getPrintifyBlueprints();
                // Add basic filtering if needed (e.g., only show apparel)
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading products...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>Error loading products:</p>
                <p className="text-sm">{error}</p>
                {/* Add retry button? */}
            </div>
        );
    }

    if (blueprints.length === 0) {
         return (
            <div className="text-center py-10">
                 <p className="text-muted-foreground">No merchandise options currently available.</p>
            </div>
         );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {blueprints.map((bp) => (
                <Card key={bp.id} className="overflow-hidden">
                    <CardContent className="p-0">
                        <AspectRatio ratio={1 / 1}>
                            <Image
                                src={bp.images[0]} // Use first image as preview
                                alt={bp.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                        </AspectRatio>
                    </CardContent>
                    <CardHeader className="p-4">
                        <CardTitle className="text-lg leading-tight h-12 overflow-hidden">{bp.title}</CardTitle>
                        <CardDescription className="text-sm">{bp.brand}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0">
                        <Link href={`/merch/${bp.id}`} passHref legacyBehavior>
                            <Button variant="outline" className="w-full">View Options</Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
} 