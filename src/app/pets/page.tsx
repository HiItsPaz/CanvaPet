"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPets } from "@/lib/petApi";
import { Pet } from "@/types/pet";
import { Loader2, AlertCircle, PlusCircle, Dog, Cat, Bird } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Helper function to get a relevant icon based on species
const getPetIcon = (species: string | null) => {
    const lowerSpecies = species?.toLowerCase();
    if (lowerSpecies?.includes('dog')) return <Dog className="h-4 w-4 mr-1 inline"/>;
    if (lowerSpecies?.includes('cat')) return <Cat className="h-4 w-4 mr-1 inline"/>;
    if (lowerSpecies?.includes('bird')) return <Bird className="h-4 w-4 mr-1 inline"/>;
    return null; // Add more or a default icon
};

export default function PetsOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const router = useRouter();

  // Fetch pets when user is loaded
  useEffect(() => {
    if (user?.id) {
      const fetchPets = async () => {
        setLoading(true);
        setError(null);
        try {
          const userPets = await getUserPets();
          setPets(userPets || []);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load pets.';
          setError(errorMessage);
          console.error("Error fetching pets:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPets();
    }
  }, [user]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin?callbackUrl=/pets");
    }
  }, [user, authLoading, router]);

  // Client-side filtering and sorting
  const filteredAndSortedPets = useMemo(() => {
    let result = pets;

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(pet => pet.species?.toLowerCase() === filterType.toLowerCase());
    }

    // Filter by search term (name or breed)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(pet => 
        pet.name?.toLowerCase().includes(lowerSearchTerm) || 
        pet.breed?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'age_asc':
          return (a.age_years || 0) - (b.age_years || 0);
        case 'age_desc':
          return (b.age_years || 0) - (a.age_years || 0);
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [pets, searchTerm, filterType, sortBy]);

  // Get unique pet types for filter dropdown
  const petTypes = useMemo(() => {
    const types = new Set(pets.map(p => p.species).filter(Boolean) as string[]);
    return Array.from(types);
  }, [pets]);

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to view your pets.</p>
        <Link href="/auth/signin?redirect=/pets" passHref>
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Your Pets</h1>
        <Link href="/pets/new" passHref>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Pet
          </Button>
        </Link>
      </div>

      {/* Filter/Sort Controls */} 
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Input 
          placeholder="Search by name or breed..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {petTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            <SelectItem value="age_asc">Age (Youngest First)</SelectItem>
            <SelectItem value="age_desc">Age (Oldest First)</SelectItem>
            <SelectItem value="recent">Date Added (Newest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pet List/Grid */} 
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin"/></div>
      ) : error ? (
        <div className="text-center text-destructive p-4"><AlertCircle className="mx-auto h-6 w-6 mb-1"/>{error}</div>
      ) : filteredAndSortedPets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {pets.length === 0 ? "You haven't added any pets yet." : "No pets found matching your filters."}
            </p>
            {pets.length === 0 && (
              <div className="text-center mt-4">
                <Link href="/pets/new" passHref>
                  <Button>Add Your First Pet</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedPets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden">
              <Link href={`/pets/${pet.id}`} passHref legacyBehavior>
                <a className="block hover:opacity-90 transition-opacity">
                  <CardContent className="p-0">
                    <AspectRatio ratio={1 / 1}>
                      <Image
                        src={pet.original_image_url || '/placeholder-pet.png'} // Use placeholder
                        alt={pet.name || 'Pet'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized // if using external URLs
                      />
                    </AspectRatio>
                  </CardContent>
                </a>
              </Link>
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{pet.name || 'Unnamed Pet'}</CardTitle>
                <CardDescription className="text-sm flex items-center">
                  {getPetIcon(pet.species)} 
                  {pet.species || 'Unknown Type'}{pet.breed ? `, ${pet.breed}` : ''}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Link href={`/pets/${pet.id}/edit`} passHref legacyBehavior>
                  <Button variant="outline" size="sm" className="w-full">Edit</Button>
                </Link>
                {/* Add Delete button later */} 
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 