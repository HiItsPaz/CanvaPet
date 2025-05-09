'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
// Imports currently not used but reserved for future implementation of filtering, tagging, and command UI features
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getUserGalleryPortraits, GalleryQueryParameters, toggleFavoritePortrait } from '@/lib/ai/openai'; // Using any[] for now
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download, Share, Star, Edit, Trash, AlertCircle, List, LayoutGrid, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase'; // Client for delete actions
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tag, Tags, X as XIcon } from 'lucide-react';
import { getPortraitTags, setPortraitTags } from '@/lib/ai/openai';
import { getUserPets, setPetProfileImage } from '@/lib/petApi'; // Correct function name
import { useRouter } from 'next/navigation'; // Import useRouter

// Replace the 'any' type definition with a more specific interface
interface GalleryPortrait {
  id: string;
  user_id: string;
  pet_id?: string;
  created_at?: string | null;
  status?: string;
  is_favorited?: boolean;
  image_versions?: {
    thumbnail_512?: string;
    generated_dalle3?: string;
    original?: string;
    upscaled_clarity_2x?: string;
    upscaled_clarity_4x?: string;
    [key: string]: string | undefined;
  };
  customization_params?: Record<string, unknown>;
  tags?: string[];
  [key: string]: unknown;
}

// Type for Pet (assuming from petApi or types)
type Pet = { id: string; name: string | null; /* other fields */ };

interface UserGalleryProps {
  userId: string;
}

// Component to display and edit tags
function TagEditor({ portraitId, userId, initialTags }: { portraitId: string, userId: string, initialTags: string[] }) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTag = async (tagToAdd: string) => {
    const newTag = tagToAdd.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setIsLoading(true);
      try {
        const updatedTags = await setPortraitTags(portraitId, userId, [...tags, newTag]);
        setTags(updatedTags);
      } catch (error: unknown) { 
        const message = error instanceof Error ? error.message : "Could not add tag";
        toast({ title: "Error adding tag", description: message, variant: "destructive" });
      }
      setIsLoading(false);
    }
    setInputValue('');
  };

  const removeTag = async (tagToRemove: string) => {
    setIsLoading(true);
    try {
      const updatedTags = await setPortraitTags(portraitId, userId, tags.filter(t => t !== tagToRemove));
      setTags(updatedTags);
    } catch (error: unknown) {
       const message = error instanceof Error ? error.message : "Could not remove tag";
       toast({ title: "Error removing tag", description: message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-1">
          <Tags className="h-4 w-4 mr-1" /> 
          {tags.length > 0 ? `${tags.length} Tag(s)` : 'Add Tags'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2">
        <div className="space-y-2">
           <p className="text-xs font-medium text-muted-foreground px-1">Edit Tags</p>
           <div className="flex flex-wrap gap-1 px-1 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="group">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 opacity-50 group-hover:opacity-100 focus:opacity-100 outline-none" aria-label={`Remove ${tag}`}>
                     <XIcon className="h-3 w-3"/>
                  </button>
                </Badge>
              ))}
               {tags.length === 0 && <span className="text-xs text-muted-foreground italic">No tags yet.</span>}
           </div>
            <div className="relative">
                 <Input 
                    placeholder="Add a tag..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="pr-8"
                 />
                 {isLoading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
           <p className="text-xs text-muted-foreground px-1">Press Enter or comma to add.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const PORTRAITS_PER_PAGE = 12; // Number of portraits to load per page

export function UserGallery({ userId }: UserGalleryProps) {
  const [portraits, setPortraits] = useState<GalleryPortrait[]>([]);
  const [pets, setPets] = useState<Pet[]>([]); // State for user's pets
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingPets, setLoadingPets] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [filterPetId, setFilterPetId] = useState<string>('all'); // State for pet filter
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Assume more pages initially
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  // Fetch Pets
  useEffect(() => {
    const fetchPets = async () => {
      if (!userId) return;
      setLoadingPets(true);
      try {
        const userPets = await getUserPets(); // No userId needed if RLS is set up correctly
        setPets(userPets || []);
      } catch (err) {
        console.error("Failed to fetch pets:", err);
      }
      setLoadingPets(false);
    };
    fetchPets();
  }, [userId]);

  // Fetch Portraits (modified for pagination)
  const fetchPortraits = useCallback(async (page = 1, loadMore = false) => {
    if (!loadMore) {
      setLoading(true);
      setPortraits([]); // Clear existing portraits on filter/sort change
      setCurrentPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    const limit = PORTRAITS_PER_PAGE;
    const offset = (page - 1) * limit;

    try {
      const params: GalleryQueryParameters = {
        userId,
        sortBy,
        filterBy: filterBy as GalleryQueryParameters['filterBy'],
        filterPetId: filterPetId === 'all' ? undefined : filterPetId,
        limit: limit + 1, // Fetch one extra to check if there are more
        offset,
      };
      const data = await getUserGalleryPortraits(params);
      
      const newPortraits = data.slice(0, limit); // Get the actual page data
      setHasMore(data.length > limit); // Check if more exist

      if (loadMore) {
        setPortraits(prev => [...prev, ...newPortraits]);
      } else {
        setPortraits(newPortraits);
      }
      setCurrentPage(page);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load portraits.';
      setError(message);
      console.error('Error fetching portraits:', err);
      setHasMore(false); // Stop trying to load more on error
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  // Rerun when filters/sort change, but not page (page is handled by loadMore)
  }, [userId, sortBy, filterBy, filterPetId]); 

  // Initial fetch and fetch on filter/sort change
  useEffect(() => {
    fetchPortraits(1); // Fetch first page when filters/sort change
  }, [fetchPortraits]); // fetchPortraits depends on filters/sort

  const loadMorePortraits = () => {
    if (!loadingMore && hasMore) {
        fetchPortraits(currentPage + 1, true); // Fetch next page, appending results
    }
  };

  const getDisplayImage = (portrait: GalleryPortrait): string => {
    // Prioritize thumbnail, then generated, then original
    return portrait.image_versions?.thumbnail_512 || 
           portrait.image_versions?.generated_dalle3 || 
           portrait.image_versions?.original ||
           '/placeholder.png'; // Fallback image
  };

  const getDownloadUrl = (portrait: GalleryPortrait): string | null => {
    // Prioritize upscaled, then generated
    return portrait.image_versions?.upscaled_clarity_4x || 
           portrait.image_versions?.upscaled_clarity_2x || 
           portrait.image_versions?.generated_dalle3 ||
           null;
  };

  const handleDelete = async (portraitId: string) => {
    if (!confirm('Are you sure you want to delete this portrait? This cannot be undone.')) return;

    try {
      const { error: dbError } = await supabase
        .from('portraits')
        .delete()
        .eq('id', portraitId);

      if (dbError) throw dbError;

      // TODO: Delete associated files from storage (requires backend logic or careful RLS)
      // const { data, error: storageError } = await supabase.storage.from('generated-images').remove([`portraits/${portraitId}/...`]);

      setPortraits(prev => prev.filter(p => p.id !== portraitId));
      toast({
        title: "Portrait Deleted",
        description: "The portrait has been successfully deleted.",
      });
    } catch (error: unknown) {      
      const message = error instanceof Error ? error.message : "Could not delete the portrait.";
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Placeholder actions - implement later in subtasks
  const handleDownload = (url: string | null, id: string) => {
    if (!url) {
      toast({ title: "Download Unavailable", description: "High-resolution image not available.", variant: "destructive" });
      return;
    }
    // Use browser download mechanism
    const link = document.createElement('a');
    link.href = url;
    link.download = `canvapet_portrait_${id}.png`; // Suggest filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started" });
  };

  const handleShare = async (id: string, url: string | null) => {
    const shareUrl = `${window.location.origin}/portrait/${id}`; // Link to a potential detail page
    const text = `Check out this AI pet portrait I created!`;
    
    if (!url) { // Fallback if no image URL for preview
        url = '/placeholder.png'; 
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My CanvaPet Portrait',
          text: text,
          url: shareUrl,
          // files: Can attempt to share file directly if API supports it and image is fetched
        });
        toast({ title: "Shared successfully!" });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({ title: "Sharing failed", description: (error as Error).message, variant: "destructive" });
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link Copied!", description: "Portrait link copied to clipboard." });
      } catch (err) {
        console.error('Failed to copy link:', err);
        toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      }
    }
  };

  const handleRequestRevision = (id: string) => {
    // Navigate to the revision page for this portrait
    router.push(`/portraits/${id}/revise`); 
  };

  const handleToggleFavorite = async (portraitId: string, currentIsFavorited: boolean) => {
    // Optimistic UI update
    setPortraits(prev => 
        prev.map(p => p.id === portraitId ? { ...p, is_favorited: !p.is_favorited } : p)
    );

    try {
        await toggleFavoritePortrait(portraitId, userId, currentIsFavorited);
        toast({
             title: currentIsFavorited ? "Removed from Favorites" : "Added to Favorites",
        });
    } catch (error: unknown) {
        console.error("Failed to toggle favorite:", error);
        // Revert optimistic update on error
        setPortraits(prev => 
            prev.map(p => p.id === portraitId ? { ...p, is_favorited: currentIsFavorited } : p)
        );
        toast({
            title: "Error",
            description: "Could not update favorite status.",
            variant: "destructive"
        });
    }
  };

  const handleSetProfilePic = async (portrait: GalleryPortrait) => {
      // Use the best available generated or upscaled image, or fallback to original if needed
      const imageUrl = 
        portrait.image_versions?.upscaled_clarity_4x ||
        portrait.image_versions?.upscaled_clarity_2x ||
        portrait.image_versions?.generated_dalle3 ||
        portrait.image_versions?.original; // Fallback to original if others fail
        
      const petId = portrait.pets?.id; // Get petId from the portrait data

      if (!imageUrl) {
          toast({ title: "Error", description: "No suitable image found for profile picture.", variant: "destructive" });
          return;
      }
      if (!petId) {
           toast({ title: "Error", description: "Could not identify the pet for this portrait.", variant: "destructive" });
          return;
      }

      try {
        await setPetProfileImage(petId, imageUrl);
        toast({ title: "Profile Picture Updated!", description: `${portrait.pets?.name || 'Pet'}&apos;s profile picture has been set.` });
        // Optionally, re-fetch pets or update local pet state if displaying profile pics elsewhere
      } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Could not set profile picture.";
          console.error("Failed to set profile picture:", error);
          toast({ title: "Update Failed", description: message, variant: "destructive" });
      }
  };

  if (loading && portraits.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your gallery...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading gallery:</p>
        <p className="text-sm">{error}</p>
        <Button onClick={() => fetchPortraits(1)} variant="destructive" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Your Gallery</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Pet Filter Dropdown */}
          <Select value={filterPetId} onValueChange={setFilterPetId} disabled={loadingPets}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Pet..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pets</SelectItem>
              {pets.map(pet => (
                <SelectItem key={pet.id} value={pet.id}>{pet.name || `Pet ${pet.id.substring(0,4)}`}</SelectItem>
              ))}
              {loadingPets && <SelectItem value="loading" disabled>Loading pets...</SelectItem>}
            </SelectContent>
          </Select>

          {/* Filter Dropdown (Status/Purchase) */}
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending/Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
              <SelectItem value="unpurchased">Unpurchased</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'newest' | 'oldest')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
             <TabsList>
               <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
               <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
             </TabsList>
           </Tabs>
        </div>
      </div>

      {loading && (
          <div className="text-center py-4">
             <Loader2 className="h-6 w-6 animate-spin inline-block" />
          </div>
      )} 

      {!loading && portraits.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No portraits found matching your filters.</p>
             <div className="text-center mt-4">
              <Link href="/pets/new" passHref>
                <Button>Create a Portrait</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {portraits.map(portrait => {
            const isFavorited = !!portrait.is_favorited;
            const currentTags = (portrait.tags as string[] | null) || [];
            // Determine if revision is possible (e.g., based on purchase status or revision count)
            // This logic needs refinement based on actual business rules for revisions
            const canRevise = portrait.is_purchased; // Simple example: only purchased can be revised
            
            return (
              <Card key={portrait.id} className="overflow-hidden group relative">
                {/* Add Favorite button overlay */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`absolute top-2 right-2 z-10 h-8 w-8 p-1 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all ${isFavorited ? 'text-yellow-400' : 'opacity-50 group-hover:opacity-100'}`}
                  onClick={() => handleToggleFavorite(portrait.id, isFavorited)}
                  aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>

                <CardContent className="p-0">
                  <Image 
                    src={getDisplayImage(portrait)}
                    alt={`Portrait for pet ${portrait.pets?.name || 'Unknown'}`}
                    width={512} // Provide appropriate dimensions
                    height={512}
                    className="aspect-square object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    unoptimized // If using external URLs like Supabase storage directly
                  />
                </CardContent>
                <CardFooter className="p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent absolute bottom-0 left-0 right-0 text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm truncate">{portrait.pets?.name || 'Untitled'}</p>
                    <p className="text-xs opacity-80">
                      {portrait.created_at ? formatDistanceToNow(new Date(portrait.created_at), { addSuffix: true }) : 'Unknown date'}
                    </p>
                    <Badge variant={portrait.status === 'completed' ? 'default' : portrait.status === 'failed' ? 'destructive' : 'secondary'} className="mt-1 text-xs px-1.5 py-0.5 h-auto">{portrait.status}</Badge>
                    {/* Display Tags (simple version) */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {currentTags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5 h-auto bg-black/20 border-white/30 text-white/80">{tag}</Badge>
                      ))}
                      {currentTags.length > 2 && <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto bg-black/20 border-white/30 text-white/80">+{currentTags.length - 2}</Badge>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleFavorite(portrait.id, isFavorited)}>
                         <Star className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-yellow-400 text-yellow-500' : ''}`} /> {isFavorited ? 'Unfavorite' : 'Favorite'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(getDownloadUrl(portrait), portrait.id)} disabled={!getDownloadUrl(portrait)}>
                        <Download className="h-4 w-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(portrait.id, getDisplayImage(portrait))}>
                        <Share className="h-4 w-4 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                         onClick={() => handleRequestRevision(portrait.id)} 
                         disabled={!canRevise} // Disable based on revision eligibility
                      >
                        <Edit className="h-4 w-4 mr-2" /> Request Revision
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSetProfilePic(portrait)} disabled={!portrait.pets?.id}>
                          <ImageIcon className="h-4 w-4 mr-2" /> Set as Pet Profile Pic
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(portrait.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
                {(portrait.status === 'pending' || portrait.status === 'processing') && 
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white"/>
                  </div>
                }
                {portrait.status === 'failed' && 
                  <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center text-white p-2">
                      <AlertCircle className="h-6 w-6 mb-1"/>
                      <span className="text-xs text-center">Generation Failed</span>
                  </div>
                }
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
            <p>List view not implemented yet.</p>
        </div>
      )}

      {/* Load More Button */} 
      <div className="mt-8 text-center">
          {hasMore && (
              <Button 
                  onClick={loadMorePortraits} 
                  disabled={loadingMore}
                  variant="outline"
              >
                  {loadingMore ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                  ) : (
                      'Load More'
                  )}
              </Button>
          )}
          {!loading && !loadingMore && !hasMore && portraits.length > 0 && (
              <p className="text-muted-foreground">You&apos;ve reached the end.</p>
          )}
      </div>
    </div>
  );
} 