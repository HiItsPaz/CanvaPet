import { createClient } from '@/lib/supabase/client';

/**
 * Fetch all pet portraits for the current user
 */
export async function getPetPortraits() {
  const supabase = createClient();
  
  // First check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  // Fetch portraits
  const { data, error } = await supabase
    .from('portraits')
    .select('id, url, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pet portraits:', error);
    return [];
  }
  
  return data;
}

/**
 * Fetch a single pet portrait by ID
 */
export async function getPetPortraitById(portraitId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('portraits')
    .select('id, url, name, created_at, user_id')
    .eq('id', portraitId)
    .single();
  
  if (error) {
    console.error(`Error fetching portrait ${portraitId}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Fetch all pet portraits for a specific pet ID
 */
export async function getPetPortraitsByPetId(petId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('portraits')
    .select('id, url, name, created_at')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching portraits for pet ${petId}:`, error);
    return [];
  }
  
  return data;
}

/**
 * Fetch the user's gallery (includes all portraits)
 */
export async function getUserGallery() {
  const supabase = createClient();
  
  // First check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  // Fetch all portraits with pet info
  const { data, error } = await supabase
    .from('portraits')
    .select(`
      id, 
      url, 
      name, 
      created_at,
      pet_id,
      pets(id, name, breed, species)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user gallery:', error);
    return [];
  }
  
  return data;
} 