/**
 * Interface for gallery portrait items
 */
export interface GalleryPortrait {
  id: string;
  user_id: string;
  pet_id?: string;
  created_at?: string | null;
  status?: string;
  is_favorited?: boolean;
  is_purchased?: boolean;
  processed_image_url?: string;
  original_image_url?: string;
  high_res_url?: string;
  image_versions?: {
    thumbnail_512?: string;
    generated_dalle3?: string;
    original?: string;
    upscaled_clarity_2x?: string;
    upscaled_clarity_4x?: string;
    [key: string]: string | undefined;
  };
  customization_params?: Record<string, unknown>;
  tags?: string[] | null;
  pets?: { 
    id?: string;
    name: string | null; 
    species?: string | null; 
    breed?: string | null; 
  } | null;
  [key: string]: unknown;
}

/**
 * Parameters for gallery queries
 */
export interface GalleryQueryParameters {
  userId: string;
  sortBy?: 'newest' | 'oldest';
  filterBy?: 'all' | 'completed' | 'pending' | 'failed' | 'purchased' | 'unpurchased' | 'favorited';
  filterPetId?: string;
  filterTags?: string[];
  limit?: number;
  offset?: number;
} 