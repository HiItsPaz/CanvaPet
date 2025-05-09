/**
 * OpenAI Service for Pet Portrait Generation
 * 
 * This service handles interactions with OpenAI's DALL-E API for generating
 * pet portraits based on customization parameters.
 */

import OpenAI from 'openai';
import { getOpenAIConfig, checkRateLimit, checkCircuitBreaker, recordOutcome, getRateLimitWaitTime } from './config';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

// Types
export interface PortraitParameters {
  petId: string;
  userId: string;
  artStyle: string;
  background: string;
  backgroundOption: string;
  orientation: 'portrait' | 'landscape';
  styleIntensity: number;
  accessories: string[];
  colorPalette?: string;
  textOverlay?: string;
  // Additional parameters can be added here
}

export interface PortraitGenerationResponse {
  portraitId: string;
  previewUrl: string | null;
  status: string;
  estimatedCompletionTime?: number;
}

export interface PortraitGenerationError {
  message: string;
  code: string;
  retryAfter?: number;
  isRateLimited?: boolean;
  isCircuitOpen?: boolean;
}

// New type for Gallery Query Parameters
export interface GalleryQueryParameters {
  userId: string;
  sortBy?: 'newest' | 'oldest';
  filterBy?: 'all' | 'purchased' | 'unpurchased' | 'completed' | 'pending' | 'failed' | 'favorited'; 
  filterTags?: string[]; // Add tags filter
  filterPetId?: string; // <-- Add pet filter
  limit?: number;
  offset?: number;
}

// Type for the data structure RETURNED BY the gallery query
// Using any for now to bypass persistent type generation issues
type GalleryPortrait = Record<string, any>; // Fallback type

// Update Portrait type if necessary (assuming it's defined in this file or imported)
// It should include fields selected below, especially `pets ( name )`
type PortraitWithPetName = Database['public']['Tables']['portraits']['Row'] & {
    pets: {
        name: string | null;
    } | null;
};

// Type for a revision (adjust based on actual generated type)
type PortraitRevision = Database['public']['Tables']['portrait_revisions']['Row'];

// Type definition (Ensure Database type is updated)
type Portrait = Database['public']['Tables']['portraits']['Row'];

/**
 * Initialize the OpenAI client with proper configuration
 */
const createOpenAIClient = (): OpenAI => {
  const config = getOpenAIConfig();
  return new OpenAI({
    apiKey: config.apiKey,
    timeout: config.timeout,
    maxRetries: config.maxRetries,
  });
};

// OpenAI client instance (lazy loaded)
let openaiClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }
  return openaiClient;
};

/**
 * Construct a detailed prompt for the pet portrait based on parameters
 */
export function constructPrompt(parameters: PortraitParameters, petImageUrl: string): string {
  // Basic prompt structure
  let prompt = `Create a ${parameters.artStyle} style portrait of this ${parameters.orientation} pet.`;
  
  // Add background details
  if (parameters.background === 'solid-color') {
    prompt += ` Use a ${parameters.backgroundOption} solid background.`;
  } else if (parameters.background === 'nature') {
    prompt += ` Place the pet in a ${parameters.backgroundOption} natural setting.`;
  } else if (parameters.background === 'abstract') {
    prompt += ` Use an abstract ${parameters.backgroundOption} background.`;
  } else if (parameters.background === 'seasonal') {
    prompt += ` Place the pet in a ${parameters.backgroundOption} seasonal setting.`;
  } else if (parameters.background === 'custom') {
    prompt += ` Use the custom background specified.`;
  }
  
  // Add accessories if any
  if (parameters.accessories && parameters.accessories.length > 0) {
    prompt += ` The pet is wearing/has ${parameters.accessories.join(', ')}.`;
  }
  
  // Add style intensity
  if (parameters.styleIntensity < 33) {
    prompt += ` Apply a subtle artistic effect.`;
  } else if (parameters.styleIntensity > 66) {
    prompt += ` Apply a dramatic, bold artistic effect.`;
  } else {
    prompt += ` Apply a balanced artistic effect.`;
  }
  
  // Add color palette if specified
  if (parameters.colorPalette) {
    prompt += ` Use a ${parameters.colorPalette} color palette.`;
  }
  
  // Add text overlay if specified
  if (parameters.textOverlay) {
    prompt += ` Include the text "${parameters.textOverlay}" in an appropriate style.`;
  }
  
  // Quality guidance
  prompt += ` Create a high-quality, professional-looking pet portrait with excellent detail and composition.`;
  
  return prompt;
}

/**
 * Generate a pet portrait using OpenAI's DALL-E
 */
export async function generatePortrait(parameters: PortraitParameters): Promise<PortraitGenerationResponse> {
  try {
    // Check circuit breaker
    if (!checkCircuitBreaker('openai')) {
      const error: PortraitGenerationError = {
        message: 'Service temporarily unavailable due to multiple failures. Try again later.',
        code: 'circuit_open',
        isCircuitOpen: true,
        retryAfter: 30 // seconds
      };
      throw error;
    }
    
    // Check rate limiting
    if (!checkRateLimit('openai')) {
      const waitTime = getRateLimitWaitTime('openai');
      const error: PortraitGenerationError = {
        message: 'Rate limit exceeded. Please try again later.',
        code: 'rate_limited',
        isRateLimited: true,
        retryAfter: Math.ceil(waitTime / 1000) // convert ms to seconds
      };
      throw error;
    }
    
    // Get pet image URL
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('original_image_url')
      .eq('id', parameters.petId)
      .single();
      
    if (petError) {
      throw new Error(`Pet not found: ${petError.message}`);
    }
    
    // Create portrait record with initial status and input URL
    const initialImageVersions = { original: pet.original_image_url };
    const { data: portrait, error: portraitError } = await supabase
      .from('portraits')
      .insert({
        pet_id: parameters.petId,
        user_id: parameters.userId,
        input_image_url: pet.original_image_url,
        status: 'pending',
        customization_params: parameters,
        image_versions: initialImageVersions,
        is_public: false,
        is_purchased: false,
      })
      .select()
      .single();
      
    if (portraitError) {
      throw new Error(`DB Error: ${portraitError.message}`);
    }
    
    // Start async processing
    processPortraitGeneration(portrait.id, parameters, pet.original_image_url)
      .catch(error => {
        console.error('Background generation failed:', error);
        updatePortraitStatus(portrait.id, 'failed', { error: error.message });
      });
    
    // Return immediately with the portrait ID and pending status
    return {
      portraitId: portrait.id,
      previewUrl: null,
      status: 'pending',
      estimatedCompletionTime: 60 // seconds, approximate time for generation
    };
  } catch (error: any) {
    console.error('Portrait generation initiation failed:', error);
    
    // If this is an expected error type, throw it directly
    if (error.code && (error.isRateLimited || error.isCircuitOpen)) {
      throw error;
    }
    
    // Otherwise, throw a generic error
    throw {
      message: `Failed to initiate portrait generation: ${error.message}`,
      code: 'generation_failed'
    };
  }
}

/**
 * Background processing function for portrait generation
 * This runs asynchronously after the API call returns
 */
async function processPortraitGeneration(
  portraitId: string,
  parameters: PortraitParameters,
  petImageUrl: string
): Promise<void> {
  let finalStatus: 'completed' | 'failed' = 'failed'; // Assume failure initially
  let updatePayload: Record<string, any> = {};

  try {
    await updatePortraitStatus(portraitId, 'processing');
    
    const prompt = constructPrompt(parameters, petImageUrl);
    const openai = getOpenAIClient();
    const startTime = Date.now();

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: parameters.orientation === 'portrait' ? "1024x1792" : "1792x1024",
      quality: "standard",
      style: "natural",
      response_format: "url"
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from OpenAI');
    }
    
    const generationTime = Math.round((Date.now() - startTime) / 1000);
    const generatedImageUrl = response.data[0].url;
    
    if (!generatedImageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }
    
    // Download the image
    const imageResponse = await fetch(generatedImageUrl);
    const imageBlob = await imageResponse.blob();
    
    // Upload to standardized path
    const fileExt = 'png'; // DALL-E typically returns PNG
    const storagePath = `portraits/${portraitId}/generated_dalle3.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(storagePath, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
      
    if (uploadError) {
      throw new Error(`Failed to upload generated image: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(storagePath);
    
    if (!publicUrl) {
      throw new Error('Failed to get public URL after upload.');
    }
    
    // Prepare update for the portraits table
    finalStatus = 'completed';
    const newVersionData = { generated_dalle3: publicUrl };
    updatePayload = {
      status: finalStatus,
      generation_time_seconds: generationTime,
      image_versions: await mergeImageVersions(portraitId, newVersionData),
      updated_at: new Date().toISOString()
    };

    recordOutcome('openai', true);
    
  } catch (error: any) {
    console.error('Portrait generation processing failed:', error);
    
    // Record failure for circuit breaker
    recordOutcome('openai', false);
    
    // Update portrait record with error
    updatePayload = { processing_error: error.message };
    finalStatus = 'failed';
    
  } finally {
    // Always update the status, adding error details if processing failed
    await updatePortraitStatus(portraitId, finalStatus, updatePayload);
  }
}

// Helper function to fetch and merge JSONB data (less ideal than DB functions/triggers)
async function mergeImageVersions(portraitId: string, newVersions: Record<string, string>): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('portraits')
    .select('image_versions')
    .eq('id', portraitId)
    .single();

  if (error) {
    console.error(`Error fetching existing image versions for ${portraitId}:`, error);
    // Return only new versions if fetch fails, or handle differently
    return newVersions;
  }

  const existingVersions = data?.image_versions || {};
  return { ...existingVersions, ...newVersions };
}

/**
 * Helper function to update portrait status
 */
async function updatePortraitStatus(
  portraitId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  additionalData: Record<string, any> = {}
): Promise<void> {
  try {
    const updateObject: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData,
    };

    const { error } = await supabase
      .from('portraits')
      .update(updateObject)
      .eq('id', portraitId);
      
    if (error) throw error;
      
  } catch (error) {
    console.error(`Failed to update portrait ${portraitId} status to ${status}:`, error);
    // Avoid throwing here to prevent infinite loops if the error is in this function itself
  }
}

/**
 * Get a portrait by ID
 */
export async function getPortrait(portraitId: string): Promise<any> {
  const { data, error } = await supabase
    .from('portraits')
    .select('*')
    .eq('id', portraitId)
    .single();
    
  if (error) {
    throw new Error(`Failed to get portrait: ${error.message}`);
  }
  
  return data;
}

/**
 * Get all portraits for a specific pet
 */
export async function getPetPortraits(petId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('portraits')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to get pet portraits: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get all portraits for a specific user
 */
export async function getUserPortraits(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('portraits')
    .select('*, pets(name, species, breed)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to get user portraits: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Fetch portraits for a user's gallery with sorting and filtering.
 */
export async function getUserGalleryPortraits(
    params: GalleryQueryParameters
): Promise<any[]> {
  const { userId, sortBy = 'newest', filterBy = 'all', filterTags, filterPetId, limit = 20, offset = 0 } = params;

  let query = supabase
    .from('portraits')
    .select(` 
      id,
      image_versions, 
      is_purchased,
      is_favorited, -- Select is_favorited
      tags, -- Select tags
      status,
      created_at,
      customization_params,
      pets ( name )
    `)
    .eq('user_id', userId);

  // Apply pet filter
  if (filterPetId) {
    query = query.eq('pet_id', filterPetId);
  }

  // Apply status/purchase filters
  if (filterBy === 'purchased') { query = query.eq('is_purchased', true); }
  else if (filterBy === 'unpurchased') { query = query.eq('is_purchased', false); }
  else if (filterBy === 'completed') { query = query.eq('status', 'completed'); }
  else if (filterBy === 'pending') { query = query.in('status', ['pending', 'processing']); }
  else if (filterBy === 'failed') { query = query.eq('status', 'failed'); }
  else if (filterBy === 'favorited') { query = query.eq('is_favorited', true); } 
  
  // Apply tags filter (contains all specified tags)
  if (filterTags && filterTags.length > 0) {
      // Ensure tags are cleaned (lowercase, trimmed) for consistent matching if needed
      const cleanedFilterTags = filterTags.map(t => t.trim().toLowerCase()).filter(t => t);
      if (cleanedFilterTags.length > 0) {
         query = query.contains('tags', cleanedFilterTags);
      }
  }
  
  // Apply sorting
  const ascending = sortBy === 'oldest';
  query = query.order('created_at', { ascending });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching gallery portraits:', error);
    throw new Error(error.message || 'Failed to fetch gallery portraits.');
  }

  return data || []; 
}

/**
 * Toggles the favorite status of a user's portrait.
 */
export async function toggleFavoritePortrait(
    portraitId: string, 
    userId: string, 
    currentStatus: boolean
): Promise<{ is_favorited: boolean }> {
    
    const newStatus = !currentStatus;

    const { data, error } = await supabase
        .from('portraits')
        .update({ is_favorited: newStatus, updated_at: new Date().toISOString() })
        .eq('id', portraitId)
        .eq('user_id', userId) // Ensure user owns the portrait
        .select('is_favorited')
        .single();

    if (error) {
        console.error(`Error toggling favorite for portrait ${portraitId}:`, error);
        throw new Error(error.message || 'Could not update favorite status.');
    }

    if (!data) {
         throw new Error('Portrait not found or update failed.');
    }

    return data;
}

// --- Revision Functions --- 

/**
 * Fetches all revisions for a specific original portrait ID, ensuring user ownership.
 */
export async function getPortraitRevisions(
    originalPortraitId: string, 
    userId: string
): Promise<PortraitRevision[]> {
    const { data, error } = await supabase
        .from('portrait_revisions')
        .select('*')
        .eq('original_portrait_id', originalPortraitId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true }); // Show oldest first usually

    if (error) {
        console.error(`Error fetching revisions for portrait ${originalPortraitId}:`, error);
        throw new Error(error.message || 'Could not fetch portrait revisions.');
    }
    return data || [];
}

/**
 * Initiates a new revision for a portrait.
 * This likely involves calling the core generation logic but storing the result
 * in the portrait_revisions table instead of updating the original portrait.
 */
export async function createPortraitRevision(
    originalPortraitId: string,
    userId: string,
    petId: string, // Need petId to get original image URL again
    newParams: PortraitParameters, // The adjusted parameters for the revision
    parentRevisionId?: string, // Optional ID of the revision this is based on
    feedback?: string
): Promise<{ revisionId: string; status: string }> {
    
    console.log(`Creating revision for portrait ${originalPortraitId} with params:`, newParams);

    // 1. Fetch original pet image URL (needed for prompt construction again)
    // Ensure pet belongs to user
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('original_image_url')
      .eq('id', petId)
      .eq('user_id', userId) // Security check
      .single();
      
    if (petError || !pet || !pet.original_image_url) {
      throw new Error('Original pet or image not found or access denied.');
    }
    const inputImageUrl = pet.original_image_url;

    // 2. Create a record in portrait_revisions
    const { data: revision, error: revisionError } = await supabase
        .from('portrait_revisions')
        .insert({
            original_portrait_id: originalPortraitId,
            user_id: userId,
            parent_revision_id: parentRevisionId,
            customization_params: newParams,
            feedback: feedback,
            status: 'pending' // Initial status
        })
        .select('id')
        .single();

    if (revisionError || !revision) {
        console.error('Error creating revision record:', revisionError);
        throw new Error(revisionError?.message || 'Failed to create revision record.');
    }

    const revisionId = revision.id;

    // 3. Trigger the asynchronous generation process for this revision
    // We need a modified version of processPortraitGeneration that updates the *revision* table
    processRevisionGeneration(revisionId, newParams, inputImageUrl)
        .catch(error => {
            console.error(`Background revision generation failed for ${revisionId}:`, error);
            updateRevisionStatus(revisionId, 'failed', { processing_error: error.message });
        });

    // 4. Return the new revision ID and pending status
    return { revisionId, status: 'pending' };
}

// --- Need a modified generation/status update process for revisions --- 

// Renamed from processPortraitGeneration to avoid conflicts if kept in same file
async function processRevisionGeneration(
  revisionId: string,
  parameters: PortraitParameters, 
  inputImageUrl: string
): Promise<void> {
  let finalStatus: 'completed' | 'failed' = 'failed';
  let updatePayload: Record<string, any> = {};

  try {
    await updateRevisionStatus(revisionId, 'processing');

    const prompt = constructPrompt(parameters, inputImageUrl); 
    const openai = getOpenAIClient(); 
    const startTime = Date.now();

    // Pass the correct parameters to the API call
    const response = await openai.images.generate({ 
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: parameters.orientation === 'portrait' ? "1024x1792" : "1792x1024",
        quality: "standard", // or parameters.quality if added
        style: "natural", // or parameters.style if added
        response_format: "url"
    }); 
    
    if (!response.data?.[0]?.url) throw new Error('No image URL from OpenAI');
    const generationTime = Math.round((Date.now() - startTime) / 1000);
    const generatedImageUrl = response.data[0].url;

    const imageResponse = await fetch(generatedImageUrl);
    const imageBlob = await imageResponse.blob();

    const fileExt = 'png'; 
    const storagePath = `revisions/${revisionId}/generated_dalle3.${fileExt}`; 
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(storagePath, imageBlob, { contentType: 'image/png', cacheControl: '3600' });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage.from('generated-images').getPublicUrl(storagePath);
    if (!publicUrl) throw new Error('Failed to get public URL after upload.');

    finalStatus = 'completed';
    const newVersionData = { generated_dalle3: publicUrl }; 
    updatePayload = {
      status: finalStatus,
      generation_time_seconds: generationTime,
      image_versions: newVersionData, 
      updated_at: new Date().toISOString()
    };
    recordOutcome('openai', true);

  } catch (error: any) {
    console.error(`Revision generation processing failed for ${revisionId}:`, error);
    recordOutcome('openai', false);
    updatePayload = { processing_error: error.message }; 

  } finally {
    await updateRevisionStatus(revisionId, finalStatus, updatePayload);
  }
}

// Helper to update revision status 
async function updateRevisionStatus(
  revisionId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  additionalData: Record<string, any> = {}
): Promise<void> {
  try {
    const updateObject = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData,
    };
    const { error } = await supabase
      .from('portrait_revisions')
      .update(updateObject)
      .eq('id', revisionId);
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to update revision ${revisionId} status to ${status}:`, error);
  }
} 

/**
 * Fetches the current tags for a user's portrait.
 */
export async function getPortraitTags(portraitId: string, userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('portraits')
        .select('tags')
        .eq('id', portraitId)
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        console.error(`Error fetching tags for portrait ${portraitId}:`, error);
        // Return empty array or throw error based on desired handling
        return []; 
    }
    // Tags are stored as TEXT[], ensure it's returned as string array
    return (data.tags as string[] | null) || []; 
}

/**
 * Sets the tags for a user's portrait, replacing existing tags.
 */
export async function setPortraitTags(portraitId: string, userId: string, tags: string[]): Promise<string[]> {
    // Basic validation/sanitization (e.g., remove empty strings, trim whitespace)
    const cleanedTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const { data, error } = await supabase
        .from('portraits')
        .update({ tags: cleanedTags, updated_at: new Date().toISOString() })
        .eq('id', portraitId)
        .eq('user_id', userId)
        .select('tags')
        .single();
        
    if (error || !data) {
        console.error(`Error setting tags for portrait ${portraitId}:`, error);
        throw new Error(error?.message || 'Could not update tags.');
    }

    return (data.tags as string[] | null) || []; 
}

/**
 * Adds one or more tags to a user's portrait.
 * Fetches existing tags and appends new unique tags.
 */
export async function addTagsToPortrait(portraitId: string, userId: string, tagsToAdd: string[]): Promise<string[]> {
    const existingTags = await getPortraitTags(portraitId, userId);
    const cleanedNewTags = tagsToAdd.map(tag => tag.trim()).filter(tag => tag.length > 0);
    const uniqueNewTags = cleanedNewTags.filter(tag => !existingTags.includes(tag));

    if (uniqueNewTags.length === 0) {
        return existingTags; // No changes needed
    }

    const updatedTags = [...existingTags, ...uniqueNewTags];
    return setPortraitTags(portraitId, userId, updatedTags);
}

/**
 * Removes one or more tags from a user's portrait.
 */
export async function removeTagsFromPortrait(portraitId: string, userId: string, tagsToRemove: string[]): Promise<string[]> {
    const existingTags = await getPortraitTags(portraitId, userId);
    const tagsToRemoveSet = new Set(tagsToRemove.map(tag => tag.trim()));

    const updatedTags = existingTags.filter(tag => !tagsToRemoveSet.has(tag));

    // Only update if tags actually changed
    if (updatedTags.length === existingTags.length) {
        return existingTags;
    }

    return setPortraitTags(portraitId, userId, updatedTags);
} 