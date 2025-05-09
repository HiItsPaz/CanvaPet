/*
 * Database Triggers for CanvaPet
 * -----------------------------
 * This migration implements database triggers for automated actions:
 * - Audit logging
 * - Data validation
 * - Cascading updates
 * - Maintaining derived data
 */

-- --------------------------------
-- Audit Logging Functions and Tables
-- --------------------------------

-- Create a table to store audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID, -- references auth.users(id)
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.audit_logs IS 'Stores audit logs for critical tables';
COMMENT ON COLUMN public.audit_logs.table_name IS 'Name of the table where the change occurred';
COMMENT ON COLUMN public.audit_logs.record_id IS 'Primary key of the record that was changed';
COMMENT ON COLUMN public.audit_logs.operation IS 'Type of operation (INSERT, UPDATE, DELETE)';
COMMENT ON COLUMN public.audit_logs.old_data IS 'JSON representation of the data before the change';
COMMENT ON COLUMN public.audit_logs.new_data IS 'JSON representation of the data after the change';
COMMENT ON COLUMN public.audit_logs.changed_by IS 'User ID who made the change, if available';
COMMENT ON COLUMN public.audit_logs.changed_at IS 'Timestamp when the change occurred';

-- Create index on audit_logs for efficient searching
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record
ON public.audit_logs (table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at
ON public.audit_logs (changed_at DESC);

-- Enable Row Level Security for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can access audit logs (in a real application, you'd have an admin role)
-- This is a placeholder and would need to be updated based on your actual authorization strategy
CREATE POLICY "Only admins can access audit logs" 
ON public.audit_logs
USING (false); -- Temporarily set to false to prevent access by normal users

-- Generic audit logging function
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            table_name, 
            record_id, 
            operation, 
            new_data, 
            changed_by
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            table_name, 
            record_id, 
            operation, 
            old_data, 
            new_data, 
            changed_by
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            to_jsonb(OLD),
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            table_name, 
            record_id, 
            operation, 
            old_data, 
            changed_by
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            to_jsonb(OLD),
            auth.uid()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_audit_log() IS 'Generic audit logging function used by multiple triggers';

-- Apply audit logging to key tables
CREATE TRIGGER trg_portraits_audit
AFTER INSERT OR UPDATE OR DELETE ON public.portraits
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

COMMENT ON TRIGGER trg_portraits_audit ON public.portraits IS 'Logs all changes to portrait records for audit purposes';

CREATE TRIGGER trg_orders_audit
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

COMMENT ON TRIGGER trg_orders_audit ON public.orders IS 'Logs all changes to order records for audit purposes';

-- --------------------------------
-- Data Validation Triggers
-- --------------------------------

-- Validate pet record function
CREATE OR REPLACE FUNCTION public.fn_validate_pet()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure species is in a valid format (uppercase)
    NEW.species = UPPER(NEW.species);
    
    -- Validate age is reasonable if provided
    IF NEW.age_years IS NOT NULL AND (NEW.age_years < 0 OR NEW.age_years > 30) THEN
        RAISE EXCEPTION 'Pet age must be between 0 and 30 years';
    END IF;
    
    -- Ensure name is properly formatted (capitalize first letter)
    IF NEW.name IS NOT NULL THEN
        NEW.name = INITCAP(NEW.name);
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.fn_validate_pet() IS 'Validates and standardizes pet record data before insertion or update';

CREATE TRIGGER trg_pets_validate
BEFORE INSERT OR UPDATE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_pet();

COMMENT ON TRIGGER trg_pets_validate ON public.pets IS 'Enforces data quality rules for pet records';

-- Validate order record function
CREATE OR REPLACE FUNCTION public.fn_validate_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure currency is uppercase
    NEW.currency = UPPER(NEW.currency);
    
    -- Validate total amount is positive
    IF NEW.total_amount <= 0 THEN
        RAISE EXCEPTION 'Order total amount must be greater than zero';
    END IF;
    
    -- Ensure status is in a valid list (you can expand this list as needed)
    IF NEW.status NOT IN ('pending', 'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') THEN
        RAISE EXCEPTION 'Invalid order status: %', NEW.status;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.fn_validate_order() IS 'Validates order data before insertion or update';

CREATE TRIGGER trg_orders_validate
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_order();

COMMENT ON TRIGGER trg_orders_validate ON public.orders IS 'Enforces data quality rules for order records';

-- --------------------------------
-- Derived Data Maintenance
-- --------------------------------

-- Create table for pet statistics
CREATE TABLE IF NOT EXISTS public.pet_statistics (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_pets INTEGER DEFAULT 0,
    total_portraits INTEGER DEFAULT 0,
    latest_portrait_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pet_statistics IS 'Stores aggregated statistics about user pets and portraits';
COMMENT ON COLUMN public.pet_statistics.user_id IS 'User ID that these statistics belong to';
COMMENT ON COLUMN public.pet_statistics.total_pets IS 'Total number of active pets the user has';
COMMENT ON COLUMN public.pet_statistics.total_portraits IS 'Total number of portraits the user has created';
COMMENT ON COLUMN public.pet_statistics.latest_portrait_date IS 'Date of the most recent portrait creation';

-- Enable Row Level Security for pet_statistics
ALTER TABLE public.pet_statistics ENABLE ROW LEVEL SECURITY;

-- Only owners can view their statistics
CREATE POLICY "Users can view their own pet statistics"
ON public.pet_statistics FOR SELECT
USING (auth.uid() = user_id);

-- Function to update pet statistics when pets are added/removed
CREATE OR REPLACE FUNCTION public.fn_update_pet_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
BEGIN
    -- Determine the user_id based on the operation
    IF TG_OP = 'INSERT' THEN
        user_id_val := NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        user_id_val := OLD.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If user_id changed, update stats for both old and new user
        IF OLD.user_id <> NEW.user_id THEN
            -- Decrement count for old user
            UPDATE public.pet_statistics
            SET 
                total_pets = (SELECT COUNT(*) FROM public.pets WHERE user_id = OLD.user_id AND is_active = TRUE),
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
            
            -- Set user_id for the new user (to be updated below)
            user_id_val := NEW.user_id;
        ELSE
            user_id_val := NEW.user_id;
        END IF;
    END IF;
    
    -- Insert or update the pet statistics for the user
    INSERT INTO public.pet_statistics (
        user_id,
        total_pets,
        updated_at
    ) VALUES (
        user_id_val,
        (SELECT COUNT(*) FROM public.pets WHERE user_id = user_id_val AND is_active = TRUE),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_pets = (SELECT COUNT(*) FROM public.pets WHERE user_id = user_id_val AND is_active = TRUE),
        updated_at = NOW();
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_update_pet_stats() IS 'Updates pet statistics when pets are added, updated, or removed';

-- Trigger for pet statistics updates
CREATE TRIGGER trg_pets_stats
AFTER INSERT OR UPDATE OR DELETE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.fn_update_pet_stats();

COMMENT ON TRIGGER trg_pets_stats ON public.pets IS 'Maintains derived pet statistics when pet records change';

-- Function to update portrait statistics
CREATE OR REPLACE FUNCTION public.fn_update_portrait_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
BEGIN
    -- Determine the user_id based on the operation
    IF TG_OP = 'INSERT' THEN
        user_id_val := NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        user_id_val := OLD.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If user_id changed, update stats for both old and new user
        IF OLD.user_id <> NEW.user_id THEN
            -- Update stats for old user
            UPDATE public.pet_statistics
            SET 
                total_portraits = (SELECT COUNT(*) FROM public.portraits WHERE user_id = OLD.user_id),
                latest_portrait_date = (
                    SELECT MAX(created_at) 
                    FROM public.portraits 
                    WHERE user_id = OLD.user_id
                ),
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
            
            -- Set user_id for the new user (to be updated below)
            user_id_val := NEW.user_id;
        ELSE
            user_id_val := NEW.user_id;
        END IF;
    END IF;
    
    -- Insert or update the pet statistics for the user
    INSERT INTO public.pet_statistics (
        user_id,
        total_portraits,
        latest_portrait_date,
        updated_at
    ) VALUES (
        user_id_val,
        (SELECT COUNT(*) FROM public.portraits WHERE user_id = user_id_val),
        (SELECT MAX(created_at) FROM public.portraits WHERE user_id = user_id_val),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_portraits = (SELECT COUNT(*) FROM public.portraits WHERE user_id = user_id_val),
        latest_portrait_date = (
            SELECT MAX(created_at) 
            FROM public.portraits 
            WHERE user_id = user_id_val
        ),
        updated_at = NOW();
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_update_portrait_stats() IS 'Updates portrait statistics when portraits are added, updated, or removed';

-- Trigger for portrait statistics updates
CREATE TRIGGER trg_portraits_stats
AFTER INSERT OR UPDATE OR DELETE ON public.portraits
FOR EACH ROW EXECUTE FUNCTION public.fn_update_portrait_stats();

COMMENT ON TRIGGER trg_portraits_stats ON public.portraits IS 'Maintains derived portrait statistics when portrait records change';

-- --------------------------------
-- Cascading Updates
-- --------------------------------

-- Function to update pet status when user is deactivated
CREATE OR REPLACE FUNCTION public.fn_cascade_user_status_to_pets()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is deactivated in the Supabase auth schema
    -- This is a placeholder since we can't directly trigger on auth.users
    -- In a real implementation, you would need to handle this differently
    
    -- Example of cascading updates - when a user is marked inactive,
    -- mark all their pets as inactive too
    IF NEW.raw_user_meta_data->>'is_active' = 'false' AND 
       (OLD.raw_user_meta_data->>'is_active' IS NULL OR OLD.raw_user_meta_data->>'is_active' = 'true') THEN
        
        UPDATE public.pets
        SET is_active = FALSE,
            updated_at = NOW()
        WHERE user_id = NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_cascade_user_status_to_pets() IS 'Cascades user status changes to related pet records';

-- Note: This trigger would need to be added to the auth.users table, which requires admin privileges
-- This is commented out and would need to be implemented by a Supabase admin
-- CREATE TRIGGER trg_users_cascade_status
-- AFTER UPDATE ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.fn_cascade_user_status_to_pets();

-- Alternative approach using a function that can be called manually or via an Edge Function
CREATE OR REPLACE FUNCTION public.deactivate_user_data(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Mark all pets as inactive
    UPDATE public.pets
    SET is_active = FALSE,
        updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- Set all portraits to private
    UPDATE public.portraits
    SET is_public = FALSE,
        updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- Log the deactivation
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by,
        changed_at
    ) VALUES (
        'user_deactivation',
        user_id_param,
        'DEACTIVATE',
        NULL,
        jsonb_build_object('user_id', user_id_param),
        auth.uid(),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.deactivate_user_data(UUID) IS 'Function to deactivate all data for a specific user, called when a user is deactivated';

-- --------------------------------
-- Auto-Creation Triggers
-- --------------------------------

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.fn_create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (NEW.id, 'user_' || NEW.id, NULL)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_create_profile_for_new_user() IS 'Automatically creates a profile record when a new user signs up';

-- Note: This trigger would need to be added to the auth.users table, which requires admin privileges
-- This is commented out and would need to be implemented by a Supabase admin
-- CREATE TRIGGER trg_create_profile_after_signup
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.fn_create_profile_for_new_user();

-- --------------------------------
-- Error Handling Example
-- --------------------------------

-- Function with error handling for pet deletion
CREATE OR REPLACE FUNCTION public.fn_safe_delete_pet()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if pet has associated portraits
    IF EXISTS (SELECT 1 FROM public.portraits WHERE pet_id = OLD.id LIMIT 1) THEN
        -- Instead of preventing deletion, log the action and allow deletion to proceed
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            operation,
            old_data,
            changed_by,
            changed_at
        ) VALUES (
            'pets_with_portraits',
            OLD.id,
            'DELETE_WITH_PORTRAITS',
            to_jsonb(OLD),
            auth.uid(),
            NOW()
        );
    END IF;
    
    RETURN OLD;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            operation,
            old_data,
            changed_by,
            changed_at
        ) VALUES (
            'pets_delete_error',
            OLD.id,
            'DELETE_ERROR',
            jsonb_build_object(
                'pet_id', OLD.id,
                'error', SQLERRM,
                'error_detail', SQLSTATE
            ),
            auth.uid(),
            NOW()
        );
        
        -- Re-raise the exception
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_safe_delete_pet() IS 'Handles pet deletion with proper error handling and logging';

CREATE TRIGGER trg_safe_delete_pet
BEFORE DELETE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.fn_safe_delete_pet();

COMMENT ON TRIGGER trg_safe_delete_pet ON public.pets IS 'Ensures proper handling and logging of pet deletion operations';

-- --------------------------------
-- Trigger to update automatic thumbnail generation
-- --------------------------------

-- Function to automatically set processed fields on portraits when applicable
CREATE OR REPLACE FUNCTION public.fn_auto_set_portrait_processing_flags()
RETURNS TRIGGER AS $$
BEGIN
    -- If a portrait gets a generated image but no thumbnail, auto-set the status to need_thumbnail
    IF NEW.generated_image_url IS NOT NULL AND 
       OLD.generated_image_url IS NULL AND 
       NEW.thumbnail_url IS NULL THEN
        
        NEW.status = 'need_thumbnail';
        
    -- If a portrait gets both generated image and thumbnail, mark as completed
    ELSIF NEW.generated_image_url IS NOT NULL AND 
          NEW.thumbnail_url IS NOT NULL AND 
          (OLD.generated_image_url IS NULL OR OLD.thumbnail_url IS NULL) THEN
        
        NEW.status = 'completed';
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.fn_auto_set_portrait_processing_flags() IS 'Automatically updates portrait status based on processing state';

CREATE TRIGGER trg_portrait_auto_status
BEFORE UPDATE ON public.portraits
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_set_portrait_processing_flags();

COMMENT ON TRIGGER trg_portrait_auto_status ON public.portraits IS 'Maintains portrait status based on image and thumbnail availability';
