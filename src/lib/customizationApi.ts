import { createClient } from '@/lib/supabase/client';
import { CustomizationParameters } from '@/types/customization';

/**
 * Type for the stored customization record
 */
export interface CustomizationRecord {
  id: string;
  pet_id: string;
  parameters: CustomizationParameters;
  preview_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  version: number;
}

/**
 * Get the current customization for a pet
 */
export async function getCustomization(petId: string): Promise<CustomizationParameters | null> {
  try {
    const supabase = createClient();
    
    // Get the latest active customization for the pet
    const { data, error } = await supabase
      .from('pet_customizations')
      .select('*')
      .eq('pet_id', petId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // If the error is "No rows found", return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching customization: ${error.message}`);
    }
    
    if (!data) {
      return null;
    }
    
    return data.parameters as CustomizationParameters;
  } catch (error) {
    console.error('Error fetching customization:', error);
    return null;
  }
}

/**
 * Save a new customization for a pet
 */
export async function saveCustomization(
  petId: string, 
  parameters: CustomizationParameters,
  previewUrl?: string
): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Get the current highest version number
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: versionData, error: versionError } = await supabase
      .from('pet_customizations')
      .select('version')
      .eq('pet_id', petId)
      .order('version', { ascending: false })
      .limit(1)
      .single();
      
    const nextVersion = versionData ? versionData.version + 1 : 1;
    
    // First, mark all existing customizations for this pet as inactive
    const { error: updateError } = await supabase
      .from('pet_customizations')
      .update({ is_active: false })
      .eq('pet_id', petId);
      
    if (updateError) {
      console.error('Error updating existing customizations:', updateError);
      // Continue anyway to create a new one
    }
    
    // Then create a new active customization
    const { data, error } = await supabase
      .from('pet_customizations')
      .insert({
        pet_id: petId,
        parameters,
        preview_url: previewUrl || null,
        is_active: true,
        version: nextVersion,
      })
      .select('id')
      .single();
    
    if (error) {
      throw new Error(`Error saving customization: ${error.message}`);
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Error saving customization:', error);
    return null;
  }
}

/**
 * Get customization history for a pet
 */
export async function getCustomizationHistory(petId: string): Promise<CustomizationRecord[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('pet_customizations')
      .select('*')
      .eq('pet_id', petId)
      .order('version', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching customization history: ${error.message}`);
    }
    
    return data as CustomizationRecord[];
  } catch (error) {
    console.error('Error fetching customization history:', error);
    return [];
  }
}

/**
 * Restore a previous customization version
 */
export async function restoreCustomizationVersion(customizationId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Get the customization to restore
    const { data: customization, error: fetchError } = await supabase
      .from('pet_customizations')
      .select('pet_id')
      .eq('id', customizationId)
      .single();
      
    if (fetchError || !customization) {
      throw new Error(`Error fetching customization to restore: ${fetchError?.message || 'Not found'}`);
    }
    
    // Mark all customizations for this pet as inactive
    const { error: updateError } = await supabase
      .from('pet_customizations')
      .update({ is_active: false })
      .eq('pet_id', customization.pet_id);
      
    if (updateError) {
      throw new Error(`Error updating existing customizations: ${updateError.message}`);
    }
    
    // Mark the selected customization as active
    const { error: restoreError } = await supabase
      .from('pet_customizations')
      .update({ is_active: true })
      .eq('id', customizationId);
      
    if (restoreError) {
      throw new Error(`Error restoring customization: ${restoreError.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error restoring customization version:', error);
    return false;
  }
}

/**
 * Delete a customization
 */
export async function deleteCustomization(customizationId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('pet_customizations')
      .delete()
      .eq('id', customizationId);
      
    if (error) {
      throw new Error(`Error deleting customization: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting customization:', error);
    return false;
  }
} 