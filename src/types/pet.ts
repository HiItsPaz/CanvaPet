import { Database } from './database.types';

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string | null;
  age_years: number | null;
  original_image_url: string | null;
  additional_image_urls: string[] | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type PetInsert = Omit<Pet, 'id' | 'created_at' | 'updated_at'>;

export type PetUpdate = Partial<Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type PetWithPortraits = Pet & {
  portraits: Array<{
    id: string;
    generated_image_url: string | null;
    thumbnail_url: string | null;
    created_at: string;
  }>;
};

// Common species options for pet selection
export const PET_SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'hamster', label: 'Hamster' },
  { value: 'guinea pig', label: 'Guinea Pig' },
  { value: 'fish', label: 'Fish' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' }
]; 