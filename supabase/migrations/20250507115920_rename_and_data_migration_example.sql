-- --------------------------------
-- Migration Example: Column Rename and Data Structure Changes
-- --------------------------------
-- This migration demonstrates:
-- 1. How to safely rename columns
-- 2. How to change data structure (splitting/combining fields)
-- 3. How to maintain backward compatibility during migrations

-- === MIGRATION UP ===

-- --------------------------------
-- Example 1: Safe Column Rename (portraits.generated_image_url → portraits.image_url)
-- --------------------------------

-- Step 1: Add the new column
ALTER TABLE public.portraits
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.portraits.image_url IS 'URL to the generated portrait image (renamed from generated_image_url)';

-- Step 2: Copy data from the old column to the new column
UPDATE public.portraits
SET image_url = generated_image_url
WHERE image_url IS NULL AND generated_image_url IS NOT NULL;

-- Step 3: Create a trigger to maintain both columns during transition period
CREATE OR REPLACE FUNCTION public.fn_sync_portrait_image_urls()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- For new inserts, sync both ways
        IF NEW.generated_image_url IS NOT NULL AND NEW.image_url IS NULL THEN
            NEW.image_url := NEW.generated_image_url;
        ELSIF NEW.image_url IS NOT NULL AND NEW.generated_image_url IS NULL THEN
            NEW.generated_image_url := NEW.image_url;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- For updates, determine which field changed
        IF NEW.generated_image_url IS DISTINCT FROM OLD.generated_image_url THEN
            NEW.image_url := NEW.generated_image_url;
        ELSIF NEW.image_url IS DISTINCT FROM OLD.image_url THEN
            NEW.generated_image_url := NEW.image_url;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.fn_sync_portrait_image_urls() IS 'Temporary function to keep old and new columns in sync during migration';

CREATE TRIGGER trg_sync_portrait_image_urls
BEFORE INSERT OR UPDATE ON public.portraits
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_portrait_image_urls();

COMMENT ON TRIGGER trg_sync_portrait_image_urls ON public.portraits IS 'Maintains both image URL columns during transition period';

-- Comment indicating migration status and timeline for column removal
COMMENT ON COLUMN public.portraits.generated_image_url IS 'DEPRECATED: Use image_url instead. This column will be removed in a future migration.';

-- --------------------------------
-- Example 2: Split Combined Field (customers.address → shipping_address, billing_address)
-- We're assuming we want to split the JSONB order.shipping_address into separate components
-- --------------------------------

-- Step 1: Add the new columns to store the split data
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_street TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT;

COMMENT ON COLUMN public.orders.shipping_street IS 'Street address for shipping (extracted from shipping_address JSONB)';
COMMENT ON COLUMN public.orders.shipping_city IS 'City for shipping (extracted from shipping_address JSONB)';
COMMENT ON COLUMN public.orders.shipping_state IS 'State/province for shipping (extracted from shipping_address JSONB)';
COMMENT ON COLUMN public.orders.shipping_postal_code IS 'Postal/ZIP code for shipping (extracted from shipping_address JSONB)';
COMMENT ON COLUMN public.orders.shipping_country IS 'Country for shipping (extracted from shipping_address JSONB)';

-- Step 2: Migrate existing data to the new structure
UPDATE public.orders
SET 
    shipping_street = shipping_address->>'street',
    shipping_city = shipping_address->>'city',
    shipping_state = shipping_address->>'state',
    shipping_postal_code = shipping_address->>'postal_code',
    shipping_country = shipping_address->>'country'
WHERE shipping_address IS NOT NULL;

-- Step 3: Create a trigger to keep both formats in sync
CREATE OR REPLACE FUNCTION public.fn_sync_shipping_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync from JSONB to individual fields
    IF NEW.shipping_address IS NOT NULL AND OLD.shipping_address IS DISTINCT FROM NEW.shipping_address THEN
        NEW.shipping_street := NEW.shipping_address->>'street';
        NEW.shipping_city := NEW.shipping_address->>'city';
        NEW.shipping_state := NEW.shipping_address->>'state';
        NEW.shipping_postal_code := NEW.shipping_address->>'postal_code';
        NEW.shipping_country := NEW.shipping_address->>'country';
    -- Sync from individual fields to JSONB
    ELSIF (
        NEW.shipping_street IS DISTINCT FROM OLD.shipping_street OR
        NEW.shipping_city IS DISTINCT FROM OLD.shipping_city OR
        NEW.shipping_state IS DISTINCT FROM OLD.shipping_state OR
        NEW.shipping_postal_code IS DISTINCT FROM OLD.shipping_postal_code OR
        NEW.shipping_country IS DISTINCT FROM OLD.shipping_country
    ) THEN
        NEW.shipping_address := jsonb_build_object(
            'street', NEW.shipping_street,
            'city', NEW.shipping_city,
            'state', NEW.shipping_state,
            'postal_code', NEW.shipping_postal_code,
            'country', NEW.shipping_country
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.fn_sync_shipping_address() IS 'Keeps shipping address JSONB and individual fields in sync during transition';

CREATE TRIGGER trg_sync_shipping_address
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_shipping_address();

COMMENT ON TRIGGER trg_sync_shipping_address ON public.orders IS 'Maintains both shipping address formats during transition';

-- Add another trigger for inserts to ensure data consistency
CREATE TRIGGER trg_sync_shipping_address_insert
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_shipping_address();

COMMENT ON TRIGGER trg_sync_shipping_address_insert ON public.orders IS 'Ensures shipping address consistency for new records';

-- Step 4: Document the change
COMMENT ON COLUMN public.orders.shipping_address IS 'DEPRECATED: Use individual shipping_* fields instead. JSONB format maintained for backward compatibility.';

-- --------------------------------
-- Example 3: Using a View for Backward Compatibility
-- --------------------------------

-- Create a view that mimics the old structure for any applications that haven't been updated
CREATE OR REPLACE VIEW public.portraits_legacy_view AS
SELECT 
    id,
    user_id,
    pet_id,
    style_id,
    input_image_url,
    generated_image_url,  -- Old column name
    thumbnail_url,
    customization_params,
    status,
    generation_time_seconds,
    is_public,
    created_at,
    updated_at
FROM public.portraits;

COMMENT ON VIEW public.portraits_legacy_view IS 'Legacy view providing backward compatibility for applications using the old schema structure';

-- Set up grants for the view to match the underlying table
GRANT SELECT ON public.portraits_legacy_view TO public;

-- === MIGRATION DOWN (ROLLBACK) ===

-- Create a commented-out section with rollback steps
/*
-- To rollback this migration, execute the following steps:

-- Remove the portrait image URL changes
DROP TRIGGER IF EXISTS trg_sync_portrait_image_urls ON public.portraits;
DROP FUNCTION IF EXISTS public.fn_sync_portrait_image_urls();

-- Clean up backward compatibility view
DROP VIEW IF EXISTS public.portraits_legacy_view;

-- Remove shipping address sync triggers
DROP TRIGGER IF EXISTS trg_sync_shipping_address ON public.orders;
DROP TRIGGER IF EXISTS trg_sync_shipping_address_insert ON public.orders;
DROP FUNCTION IF EXISTS public.fn_sync_shipping_address();

-- Remove the new columns added for shipping address split
ALTER TABLE public.orders
DROP COLUMN IF EXISTS shipping_street,
DROP COLUMN IF EXISTS shipping_city,
DROP COLUMN IF EXISTS shipping_state,
DROP COLUMN IF EXISTS shipping_postal_code,
DROP COLUMN IF EXISTS shipping_country;

-- Remove the new portrait image URL column
ALTER TABLE public.portraits
DROP COLUMN IF EXISTS image_url;

-- Log the rollback
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
                'migration', '20250507115920_rename_and_data_migration_example',
                'description', 'Rolled back column rename and data structure changes'
            ),
            NULL
        );
    END IF;
END
$$;
*/
