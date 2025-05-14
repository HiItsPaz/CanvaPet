'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
// Imports currently not used but reserved for future implementation of filtering, tagging, and command UI features
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getUserGalleryPortraits, toggleFavoritePortrait } from '@/lib/ai/openai'; 
import { GalleryPortrait, GalleryQueryParameters } from '@/types/gallery';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download, Share, Star, Edit, Trash, AlertCircle, List, LayoutGrid, Loader2, Image as ImageIcon, Maximize, Minimize, Grid } from 'lucide-react';
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
import { GalleryGrid } from './GalleryGrid'; // Import our new component

// Type for grid density control
type GridDensity = 'compact' | 'normal' | 'comfortable';

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
  const [gridDensity, setGridDensity] = useState<GridDensity>('normal');
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
      
      const newPortraits = data.slice(0, limit) as GalleryPortrait[]; // Get the actual page data
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

  const handleDownload = (url: string | null, id: string) => {
    if (!url) {
      toast({
        title: "Download Failed",
        description: "No high-resolution image available for download.",
        variant: "destructive",
      });
      return;
    }

    // Create an anchor and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `pet-portrait-${id}.jpg`; // Default filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Download Started",
      description: "Your image is being downloaded.",
    });
  };

  const handleShare = async (id: string, url: string | null) => {
    if (!url) {
      toast({
        title: "Share Failed",
        description: "No image available to share.",
        variant: "destructive",
      });
      return;
    }

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Pet Portrait',
          text: 'Check out this portrait of my pet!',
          url: window.location.origin + `/portraits/${id}`, // Use the portrait specific page if available
        });
        return;
      } catch (err) {
        console.error('Share failed:', err);
        // Fall back to clipboard
      }
    }

    // Fallback if Web Share API fails or isn't available
    try {
      await navigator.clipboard.writeText(window.location.origin + `/portraits/${id}`);
      toast({
        title: "Link Copied",
        description: "Portrait link copied to clipboard.",
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      toast({
        title: "Share Failed",
        description: "Could not copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestRevision = (id: string) => {
    router.push(`/portraits/${id}/revise`);
  };

  const handleToggleFavorite = async (portraitId: string, currentIsFavorited: boolean) => {
    try {
      // The toggleFavoritePortrait function does the negation internally
      const result = await toggleFavoritePortrait(portraitId, userId, currentIsFavorited);
      
      // Update local state with the result returned from the function
      setPortraits(prev => 
        prev.map(p => 
          p.id === portraitId 
            ? { ...p, is_favorited: result.is_favorited } 
            : p
        )
      );
      
      toast({
        title: currentIsFavorited ? "Removed from Favorites" : "Added to Favorites",
        description: currentIsFavorited 
          ? "Portrait removed from your favorites." 
          : "Portrait added to your favorites!",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not update favorite status.";
      console.error('Favorite toggle failed:', error);
      toast({
        title: "Action Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleSetProfilePic = async (portrait: GalleryPortrait) => {
    if (!portrait.pets?.id) {
      toast({
        title: "Action Failed",
        description: "This portrait is not associated with a pet.",
        variant: "destructive",
      });
      return;
    }

    try {
      await setPetProfileImage(portrait.pets.id, getDisplayImage(portrait));
      toast({
        title: "Profile Picture Updated",
        description: `Profile picture updated for ${portrait.pets.name || 'your pet'}.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not update profile picture.";
      console.error('Profile pic update failed:', error);
      toast({
        title: "Action Failed",
        description: message,
        variant: "destructive",
      });
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

          {/* Grid Density Control */}
          {viewMode === 'grid' && (
            <Select value={gridDensity} onValueChange={(v) => setGridDensity(v as GridDensity)}>
              <SelectTrigger className="w-[150px]">
                <Grid className="h-4 w-4 mr-2" /> <SelectValue placeholder="Grid Density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">
                  <div className="flex items-center">
                    <Minimize className="h-4 w-4 mr-2" />
                    <span>Compact</span>
                  </div>
                </SelectItem>
                <SelectItem value="normal">
                  <div className="flex items-center">
                    <Grid className="h-4 w-4 mr-2" />
                    <span>Normal</span>
                  </div>
                </SelectItem>
                <SelectItem value="comfortable">
                  <div className="flex items-center">
                    <Maximize className="h-4 w-4 mr-2" />
                    <span>Comfortable</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
             <TabsList>
               <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
               <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
             </TabsList>
           </Tabs>
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>Error loading gallery:</p>
          <p className="text-sm">{error}</p>
          <Button onClick={() => fetchPortraits(1)} variant="destructive" className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {!error && (
        <>
          {viewMode === 'grid' ? (
            <GalleryGrid
              portraits={portraits}
              isLoading={loading}
              onFavorite={handleToggleFavorite}
              onDownload={handleDownload}
              onShare={handleShare}
              onRequestRevision={handleRequestRevision}
              onSetProfilePic={handleSetProfilePic}
              onDelete={handleDelete}
              density={gridDensity}
            />
          ) : (
            <div className="space-y-4">
              <p>List view not implemented yet.</p>
            </div>
          )}
        </>
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