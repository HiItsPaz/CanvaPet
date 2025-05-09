-- Create pet_customizations table for storing customization parameters
CREATE TABLE IF NOT EXISTS public.pet_customizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    parameters JSONB NOT NULL,
    preview_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.pet_customizations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own pet customizations
CREATE POLICY "Users can view their own pet customizations" 
    ON public.pet_customizations
    FOR SELECT 
    USING (
        pet_id IN (
            SELECT id FROM public.pets 
            WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to insert customizations for their own pets
CREATE POLICY "Users can insert customizations for their own pets" 
    ON public.pet_customizations
    FOR INSERT 
    WITH CHECK (
        pet_id IN (
            SELECT id FROM public.pets 
            WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to update customizations for their own pets
CREATE POLICY "Users can update their own pet customizations" 
    ON public.pet_customizations
    FOR UPDATE 
    USING (
        pet_id IN (
            SELECT id FROM public.pets 
            WHERE user_id = auth.uid()
        )
    );

-- Policy to allow users to delete customizations for their own pets
CREATE POLICY "Users can delete their own pet customizations" 
    ON public.pet_customizations
    FOR DELETE 
    USING (
        pet_id IN (
            SELECT id FROM public.pets 
            WHERE user_id = auth.uid()
        )
    );

-- Add an index on pet_id for faster lookups
CREATE INDEX IF NOT EXISTS pet_customizations_pet_id_idx ON public.pet_customizations(pet_id);

-- Add an index on the combination of pet_id and is_active for faster lookups of active customizations
CREATE INDEX IF NOT EXISTS pet_customizations_pet_id_is_active_idx ON public.pet_customizations(pet_id, is_active);

-- Add a trigger to update the updated_at timestamp on updates
CREATE OR REPLACE FUNCTION update_pet_customizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pet_customizations_updated_at
BEFORE UPDATE ON public.pet_customizations
FOR EACH ROW
EXECUTE FUNCTION update_pet_customizations_updated_at(); 