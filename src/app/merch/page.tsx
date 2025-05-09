'use client';

import { MerchBrowser } from "@/components/merch/MerchBrowser";

export default function MerchPage() {

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
             <h1 className="text-3xl font-bold mb-6">Choose Your Merchandise</h1>
             <p className="text-muted-foreground mb-8">
                 Select an item below to customize it with your pet portrait.
             </p>
             <MerchBrowser />
        </div>
    );
} 