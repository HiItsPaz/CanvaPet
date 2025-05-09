-- Create portraits table for storing generated pet portraits
CREATE TABLE IF NOT EXISTS portraits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL, -- Link to the style used, if predefined
  customization_params JSONB, -- Store all parameters used for generation
  input_image_url TEXT NOT NULL, -- URL of the original pet image used
  -- Store URLs for different image versions generated/uploaded
  image_versions JSONB, -- Example: {"original": "...", "thumbnail_512": "...", "generated_dalle3": "...", "upscaled_clarity_4x": "..."}
  status TEXT NOT NULL DEFAULT 'pending', -- Generation status: pending, processing, completed, failed
  generation_time_seconds INTEGER, -- Time taken for the initial generation
  is_purchased BOOLEAN DEFAULT FALSE, -- Tracks if the user has purchased the high-res/unwatermarked version
  is_public BOOLEAN DEFAULT FALSE, -- If the user made this portrait public
  is_favorited BOOLEAN DEFAULT FALSE, -- Indicates if the user has marked this portrait as a favorite
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments to clarify column purposes
COMMENT ON COLUMN portraits.style_id IS 'Foreign key referencing the art style used, if selected from predefined options';
COMMENT ON COLUMN portraits.customization_params IS 'JSON data storing all customization options applied for generation';
COMMENT ON COLUMN portraits.input_image_url IS 'URL of the source pet image provided by the user';
COMMENT ON COLUMN portraits.image_versions IS 'JSONB storing URLs for various generated/processed image versions (original, thumbnail, generated, upscaled)';
COMMENT ON COLUMN portraits.status IS 'Lifecycle status of the portrait generation process';
COMMENT ON COLUMN portraits.generation_time_seconds IS 'Approximate time taken for the initial AI generation step';
COMMENT ON COLUMN portraits.is_purchased IS 'Indicates if the user has paid for the full-resolution/unwatermarked portrait';
COMMENT ON COLUMN portraits.is_public IS 'Indicates if the user has chosen to make this portrait publicly viewable';
COMMENT ON COLUMN portraits.is_favorited IS 'Indicates if the user has marked this portrait as a favorite';

-- Create index for querying portraits by user
CREATE INDEX IF NOT EXISTS portraits_user_id_idx ON portraits(user_id);

-- Create index for querying portraits by pet
CREATE INDEX IF NOT EXISTS portraits_pet_id_idx ON portraits(pet_id);

-- Create index for querying portraits by status
CREATE INDEX IF NOT EXISTS portraits_status_idx ON portraits(status);

-- Enable RLS (Row Level Security)
ALTER TABLE portraits ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Keep existing policies, ensure they work with the schema)
CREATE POLICY "Users can view their own portraits" 
    ON public.portraits FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Public portraits can be viewed by anyone" 
    ON public.portraits FOR SELECT 
    USING (is_public = TRUE);

CREATE POLICY "Users can insert their own portraits" 
    ON public.portraits FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portraits" 
    ON public.portraits FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portraits" 
    ON public.portraits FOR DELETE 
    USING (auth.uid() = user_id);

-- Function and Trigger for updated_at (Keep existing)
CREATE OR REPLACE FUNCTION update_portraits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portraits_updated_at
BEFORE UPDATE ON portraits
FOR EACH ROW
EXECUTE FUNCTION update_portraits_updated_at(); 