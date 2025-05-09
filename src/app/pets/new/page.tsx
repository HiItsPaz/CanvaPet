"use client";

import { PetForm } from "@/components/pets/PetForm";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddPetPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }

    if (!user) {
         return (
             <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                 <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                 <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
                 <p className="text-muted-foreground mb-6">You need to be logged in to add a pet.</p>
                 <Link href="/auth/signin?redirect=/pets/new" passHref>
                     <Button>Log In</Button>
                 </Link>
             </div>
         );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
             <h1 className="text-3xl font-bold mb-6">Add New Pet</h1>
             {/* Render the form for creating a new pet */}
             <PetForm /> 
        </div>
    );
} 