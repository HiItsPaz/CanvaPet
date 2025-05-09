"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PetForm } from "@/components/pets/PetForm";
import { getPetById } from '@/lib/petApi';
import { Pet } from '@/types/pet';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditPetPage() {
    const params = useParams();
    const petId = params.id as string;
    const { user, loading: authLoading } = useAuth();

    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (petId && user?.id) {
            const fetchPet = async () => {
                setLoading(true);
                setError(null);
                try {
                    const petData = await getPetById(petId);
                    if (!petData || petData.user_id !== user.id) {
                        throw new Error('Pet not found or access denied.');
                    }
                    setPet(petData);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message || 'Failed to load pet data.');
                    } else {
                        setError('Failed to load pet data.');
                    }
                    console.error("Error fetching pet for edit:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPet();
        }
         else if (!authLoading && !user) {
             setError('You must be logged in to edit pet details.');
             setLoading(false);
         }
         else if (!petId) {
             setError('Invalid Pet ID.');
             setLoading(false);
         }
    }, [petId, user, authLoading]);

     if (loading || authLoading) {
        return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }

    if (error) {
         return (
             <div className="container mx-auto py-8 px-4 md:px-6 text-center">
                 <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                 <h1 className="text-2xl font-bold mb-2">Error Loading Pet</h1>
                 <p className="text-muted-foreground mb-6">{error}</p>
                 <Link href="/pets" passHref>
                     <Button variant="outline">Back to Pets</Button>
                 </Link>
             </div>
         );
    }
    
     if (!pet) {
        // Should be caught by error state, but for safety
        return <p>Pet could not be loaded.</p>;
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
             <h1 className="text-3xl font-bold mb-6">Edit Pet Profile</h1>
             {/* Pass the fetched pet data to the form */}
             <PetForm pet={pet} /> 
        </div>
    );
} 