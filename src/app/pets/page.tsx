"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPets } from "@/lib/petApi";
import { Pet } from "@/types/pet";
import { PlusCircle, Dog, Cat, Bird } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ContentLoader } from "@/components/ui/content-loader";
import { AnimatedLink } from "@/components/ui/animated-link";
import { MicroInteraction } from "@/components/ui/animation-library";
import { SectionTransition } from "@/components/ui/section-transition";
import { AnimatedButton } from "@/components/ui/animated-button";

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
    return (
      <ContentLoader 
        isLoading={true} 
        variant="pet" 
        loadingText="Checking authentication..."
        className="min-h-[400px]"
      >
        <div />
      </ContentLoader>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <AnimatedLink href="/auth/signin?redirect=/pets">
          <AnimatedButton animationPreset="glow">Log In</AnimatedButton>
        </AnimatedLink>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <SectionTransition direction="down" duration={0.4}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Your Pets</h1>
          <AnimatedLink href="/pets/new" hoverEffect="none">
            <AnimatedButton animationPreset="lift">
              <PlusCircle className="h-4 w-4 mr-2" /> Add New Pet
            </AnimatedButton>
          </AnimatedLink>
        </div>
      </SectionTransition>

      <SectionTransition direction="left" duration={0.4} delay={0.1}>
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
      </SectionTransition>

      <SectionTransition direction="up" duration={0.4} delay={0.2}>
        {/* Pet List/Grid */} 
        <ContentLoader isLoading={loading} variant="pet" loadingText="Loading your pets..." className="min-h-[200px]">
          {error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : filteredAndSortedPets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {pets.length === 0 ? "You haven't added any pets yet." : "No pets found matching your filters."}
                </p>
                {pets.length === 0 && (
                  <div className="text-center mt-4">
                    <AnimatedLink href="/pets/new" hoverEffect="none">
                      <AnimatedButton animationPreset="pulse" continuous={true}>
                        Add Your First Pet
                      </AnimatedButton>
                    </AnimatedLink>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedPets.map((pet, index) => (
                <MicroInteraction key={pet.id} variant="hover" hoverPreset="hoverScale">
                  <SectionTransition 
                    direction="up" 
                    duration={0.3} 
                    delay={0.05 * index} 
                    animateOnScroll={true}
                  >
                    <Card className="overflow-hidden">
                      <AnimatedLink href={`/pets/${pet.id}`} hoverEffect="none" className="block">
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
                      </AnimatedLink>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg truncate">{pet.name || 'Unnamed Pet'}</CardTitle>
                        <CardDescription className="text-sm flex items-center">
                          {getPetIcon(pet.species)} 
                          {pet.species || 'Unknown Type'}{pet.breed ? `, ${pet.breed}` : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <AnimatedLink href={`/pets/${pet.id}/edit`} hoverEffect="none" className="w-full">
                          <AnimatedButton variant="outline" size="sm" className="w-full" animationPreset="lift">
                            Edit
                          </AnimatedButton>
                        </AnimatedLink>
                      </CardFooter>
                    </Card>
                  </SectionTransition>
                </MicroInteraction>
              ))}
            </div>
          )}
        </ContentLoader>
      </SectionTransition>
    </div>
  );
} 