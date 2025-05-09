"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Pet } from "@/types/pet";
import { getPetById, deletePet } from "@/lib/petApi";
import { AlertCircle, Trash2, Loader2, Pencil, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

// Reusing pet icon logic
import { Dog, Cat, Bird } from 'lucide-react'; 
const getPetIcon = (species: string | null) => {
    const lowerSpecies = species?.toLowerCase();
    if (lowerSpecies?.includes('dog')) return <Dog className="h-5 w-5 mr-2 inline text-muted-foreground"/>;
    if (lowerSpecies?.includes('cat')) return <Cat className="h-5 w-5 mr-2 inline text-muted-foreground"/>;
    if (lowerSpecies?.includes('bird')) return <Bird className="h-5 w-5 mr-2 inline text-muted-foreground"/>;
    return null; 
};

export default function PetDetailsPage() {
  const params = useParams();
  const petId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (petId && user?.id) { // Only fetch if we have ID and user
      const fetchPet = async () => {
        setLoading(true);
        setError(null);
        try {
          const petData = await getPetById(petId);
          // Verify ownership
          if (!petData || petData.user_id !== user.id) {
            throw new Error('Pet not found or access denied.');
          }
          setPet(petData);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load pet details.';
          setError(errorMessage);
          console.error("Error fetching pet:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPet();
    }
    // Handle cases where petId is missing or user is not loaded yet
    else if (!authLoading && !user) {
      setError('You must be logged in to view pet details.');
      setLoading(false);
    }
    else if (!petId) {
      setError('Invalid Pet ID.');
      setLoading(false);
    }
  }, [petId, user, authLoading]);

  const handleDelete = async () => {
    if (!pet) return;
    setIsDeleting(true);
    try {
      await deletePet(pet.id);
      toast({
        title: "Pet Deleted",
        description: `${pet.name || 'The pet'} has been removed.`,
      });
      router.push('/pets'); // Redirect to overview page
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      console.error("Delete failed:", err);
      toast({ title: "Delete Failed", description: errorMessage, variant: "destructive" });
      setIsDeleting(false);
    }
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-lg font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <Link href="/pets" passHref>
            <Button variant="outline" className="mt-4">Back to Pets</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!pet) {
    // Should be caught by error state, but for safety
    return <p>Pet not found.</p>;
  }

  const allImages = [
    pet.original_image_url,
    ...(pet.additional_image_urls || [])
  ].filter(Boolean) as string[]; // Filter out null/undefined

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Link href="/pets" passHref>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to All Pets
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/pets/${pet.id}/edit`} passHref>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Trash2 className="h-4 w-4 mr-1" />} 
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                This action cannot be undone. This will permanently delete the profile for 
                <strong>{pet.name || 'this pet'}</strong> and remove its association with any generated portraits.
                Portraits themselves will not be deleted automatically.
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? 'Deleting...' : 'Yes, delete pet'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            {getPetIcon(pet.species)} {pet.name || 'Unnamed Pet'}
          </CardTitle>
          <CardDescription>
            {pet.breed || 'Unknown Breed'} {pet.species ? `(${pet.species})` : ''}
            {pet.age_years !== null ? ` - ${pet.age_years} year(s) old` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allImages.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allImages.map((imgUrl, index) => (
                  <AspectRatio key={index} ratio={1/1} className="bg-muted rounded overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={`${pet.name || 'Pet'} photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      unoptimized
                    />
                  </AspectRatio>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">No photos uploaded for this pet yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 