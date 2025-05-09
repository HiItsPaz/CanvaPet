import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pet, PetInsert, PetUpdate } from "@/types/pet";

// Create a Supabase client
const createClient = () => createClientComponentClient();

/**
 * Get all pets for the current user
 */
export async function getUserPets(): Promise<Pet[]> {
  const supabase = createClient();
  
  const { data: pets, error } = await supabase
    .from("pets")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching pets:", error);
    throw new Error(error.message);
  }
  
  return pets || [];
}

/**
 * Get a specific pet by ID
 */
export async function getPetById(id: string): Promise<Pet | null> {
  const supabase = createClient();
  
  const { data: pet, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching pet:", error);
    throw new Error(error.message);
  }
  
  return pet;
}

/**
 * Create a new pet
 */
export async function createPet(pet: PetInsert): Promise<Pet> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("pets")
    .insert(pet)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating pet:", error);
    throw new Error(error.message);
  }
  
  return data;
}

/**
 * Update an existing pet
 */
export async function updatePet(id: string, pet: PetUpdate): Promise<Pet> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("pets")
    .update(pet)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating pet:", error);
    throw new Error(error.message);
  }
  
  return data;
}

/**
 * Delete a pet
 */
export async function deletePet(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting pet:", error);
    throw new Error(error.message);
  }
}

/**
 * Update pet's primary image
 */
export async function updatePetPrimaryImage(id: string, imageUrl: string): Promise<Pet> {
  return updatePet(id, { original_image_url: imageUrl });
}

/**
 * Add an image to pet's additional images
 */
export async function addPetImage(id: string, imageUrl: string): Promise<Pet> {
  const pet = await getPetById(id);
  if (!pet) throw new Error("Pet not found");
  
  const currentImages = pet.additional_image_urls || [];
  const updatedImages = [...currentImages, imageUrl];
  
  return updatePet(id, { additional_image_urls: updatedImages });
}

/**
 * Remove an image from pet's additional images
 */
export async function removePetImage(id: string, imageUrl: string): Promise<Pet> {
  const pet = await getPetById(id);
  if (!pet) throw new Error("Pet not found");
  
  const currentImages = pet.additional_image_urls || [];
  const updatedImages = currentImages.filter(url => url !== imageUrl);
  
  return updatePet(id, { additional_image_urls: updatedImages });
}

/**
 * Get pet with its generated portraits
 */
export async function getPetWithPortraits(id: string) {
  const supabase = createClient();
  
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();
  
  if (petError) {
    console.error("Error fetching pet:", petError);
    throw new Error(petError.message);
  }
  
  const { data: portraits, error: portraitsError } = await supabase
    .from("portraits")
    .select("id, generated_image_url, thumbnail_url, created_at")
    .eq("pet_id", id)
    .order("created_at", { ascending: false });
  
  if (portraitsError) {
    console.error("Error fetching portraits:", portraitsError);
    throw new Error(portraitsError.message);
  }
  
  return {
    ...pet,
    portraits: portraits || []
  };
}

/**
 * Sets a specific image URL as the pet's primary profile image.
 * This overwrites the existing `original_image_url`.
 */
export async function setPetProfileImage(petId: string, imageUrl: string): Promise<Pet> {
  const supabase = createClient();
  
  // First, verify the pet belongs to the current user (important!)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated.');
  }
  const userId = session.user.id;

  const { data: petCheck, error: checkError } = await supabase
    .from('pets')
    .select('id')
    .eq('id', petId)
    .eq('user_id', userId)
    .single();

  if (checkError || !petCheck) {
    throw new Error('Pet not found or access denied.');
  }

  // Now update the pet record
  return updatePet(petId, { original_image_url: imageUrl });
} 