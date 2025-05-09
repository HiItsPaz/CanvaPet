-- --------------------------------
-- Migration Example: Adding Pet Size and Coat Features
-- --------------------------------
-- This migration demonstrates how to safely add new features to existing tables
-- with data preservation and rollback capability.

-- === MIGRATION UP ===

-- Step 1: Add the new columns to the pets table with NULL values
-- Using ALTER TABLE ADD COLUMN with NULL constraint allows existing rows to be preserved
ALTER TABLE public.pets
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS coat_type TEXT,
ADD COLUMN IF NOT EXISTS coat_color TEXT;

COMMENT ON COLUMN public.pets.size IS 'Size category of the pet (e.g., small, medium, large)';
COMMENT ON COLUMN public.pets.coat_type IS 'Type of pet coat (e.g., short, long, curly)';
COMMENT ON COLUMN public.pets.coat_color IS 'Primary color of the pet''s coat';

-- Step 2: Create a temporary function to make an educated guess at pet size based on species/breed
-- This helps with data backfilling
CREATE OR REPLACE FUNCTION public.temp_guess_pet_size()
RETURNS VOID AS $$
BEGIN
    -- Update size for dogs based on common breed sizes
    UPDATE public.pets
    SET size = 'small'
    WHERE species = 'DOG' 
    AND size IS NULL
    AND (
        breed ILIKE '%chihuahua%' OR
        breed ILIKE '%yorkie%' OR
        breed ILIKE '%pomeranian%' OR
        breed ILIKE '%maltese%' OR
        breed ILIKE '%shih tzu%'
    );
    
    UPDATE public.pets
    SET size = 'medium'
    WHERE species = 'DOG' 
    AND size IS NULL
    AND (
        breed ILIKE '%beagle%' OR
        breed ILIKE '%bulldog%' OR
        breed ILIKE '%corgi%' OR
        breed ILIKE '%cocker spaniel%' OR
        breed ILIKE '%pit bull%'
    );
    
    UPDATE public.pets
    SET size = 'large'
    WHERE species = 'DOG' 
    AND size IS NULL
    AND (
        breed ILIKE '%labrador%' OR
        breed ILIKE '%german shepherd%' OR
        breed ILIKE '%golden retriever%' OR
        breed ILIKE '%rottweiler%' OR
        breed ILIKE '%husky%'
    );
    
    -- Default size for remaining dogs
    UPDATE public.pets
    SET size = 'medium'
    WHERE species = 'DOG' AND size IS NULL;
    
    -- Cats are generally small to medium
    UPDATE public.pets
    SET size = 'small'
    WHERE species = 'CAT' AND size IS NULL;
    
    -- Default for any remaining pets
    UPDATE public.pets
    SET size = 'unknown'
    WHERE size IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Execute the backfill function
SELECT public.temp_guess_pet_size();

-- Step 4: Drop the temporary function as it's no longer needed
DROP FUNCTION public.temp_guess_pet_size();

-- Step 5: Create an enum type for size to enforce data integrity going forward
-- First, we ensure all data conforms to our expected values
UPDATE public.pets
SET size = 'unknown'
WHERE size NOT IN ('small', 'medium', 'large', 'unknown');

-- Now create a check constraint to enforce the enum-like behavior
ALTER TABLE public.pets
ADD CONSTRAINT check_pet_size
CHECK (size IN ('small', 'medium', 'large', 'unknown'));

-- Step 6: Create a new index to support filtering by the new columns
CREATE INDEX IF NOT EXISTS idx_pets_size_coat
ON public.pets (size, coat_type);

COMMENT ON INDEX idx_pets_size_coat IS 'Supports filtering pets by size and coat type attributes';

-- Step 7: Add a trigger to validate coat_color and coat_type on update/insert
CREATE OR REPLACE FUNCTION public.fn_validate_pet_coat()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert coat_type to lowercase for consistency
    IF NEW.coat_type IS NOT NULL THEN
        NEW.coat_type = LOWER(NEW.coat_type);
    END IF;
    
    -- Validate and standardize coat_color (first letter uppercase, rest lowercase)
    IF NEW.coat_color IS NOT NULL THEN
        NEW.coat_color = INITCAP(LOWER(NEW.coat_color));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.fn_validate_pet_coat() IS 'Validates and standardizes pet coat information';

CREATE TRIGGER trg_validate_pet_coat
BEFORE INSERT OR UPDATE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_pet_coat();

COMMENT ON TRIGGER trg_validate_pet_coat ON public.pets IS 'Ensures pet coat data is properly formatted';

-- Step 8: Document the changes in the audit_log table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            operation,
            new_data,
            changed_by
        ) VALUES (
            'schema_migration',
            uuid_generate_v4(),
            'MIGRATION',
            jsonb_build_object(
                'migration', '20250507115822_schema_update_example',
                'description', 'Added pet size and coat features'
            ),
            NULL
        );
    END IF;
END
$$;

-- === MIGRATION DOWN (ROLLBACK) ===

-- Create a commented-out section with rollback steps
/*
-- To rollback this migration, execute the following steps:

-- Step 1: Drop the trigger and function for coat validation
DROP TRIGGER IF EXISTS trg_validate_pet_coat ON public.pets;
DROP FUNCTION IF EXISTS public.fn_validate_pet_coat();

-- Step 2: Drop the index on the new columns
DROP INDEX IF EXISTS idx_pets_size_coat;

-- Step 3: Remove the constraint
ALTER TABLE public.pets
DROP CONSTRAINT IF EXISTS check_pet_size;

-- Step 4: Drop the newly added columns
ALTER TABLE public.pets
DROP COLUMN IF EXISTS size,
DROP COLUMN IF EXISTS coat_type,
DROP COLUMN IF EXISTS coat_color;

-- Step 5: Log the rollback in the audit system
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            operation,
            new_data,
            changed_by
        ) VALUES (
            'schema_migration',
            uuid_generate_v4(),
            'ROLLBACK',
            jsonb_build_object(
                'migration', '20250507115822_schema_update_example',
                'description', 'Rolled back pet size and coat features'
            ),
            NULL
        );
    END IF;
END
$$;
*/
