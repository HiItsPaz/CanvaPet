-- Create portrait_revisions table to track revision history
CREATE TABLE IF NOT EXISTS portrait_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_portrait_id UUID NOT NULL REFERENCES portraits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_revision_id UUID REFERENCES portrait_revisions(id) ON DELETE SET NULL, -- Link to previous revision if applicable
  customization_params JSONB NOT NULL, -- Parameters used for this revision
  image_versions JSONB, -- URLs for images generated for this revision (thumbnail, generated, upscaled)
  status TEXT NOT NULL DEFAULT 'pending', -- Generation status for this specific revision
  generation_time_seconds INTEGER,
  feedback TEXT, -- Optional user feedback on why revision was needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments
COMMENT ON TABLE portrait_revisions IS 'Stores revision history for generated pet portraits';
COMMENT ON COLUMN portrait_revisions.original_portrait_id IS 'FK to the initial portrait record';
COMMENT ON COLUMN portrait_revisions.parent_revision_id IS 'FK to the previous revision in the chain, if any';
COMMENT ON COLUMN portrait_revisions.customization_params IS 'Customization parameters used for this specific revision generation';
COMMENT ON COLUMN portrait_revisions.image_versions IS 'JSONB storing URLs for images generated specifically for this revision';
COMMENT ON COLUMN portrait_revisions.status IS 'Status of this revision generation (pending, processing, completed, failed)';
COMMENT ON COLUMN portrait_revisions.feedback IS 'User feedback provided when requesting this revision';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_portrait_revisions_original_id ON portrait_revisions(original_portrait_id);
CREATE INDEX IF NOT EXISTS idx_portrait_revisions_user_id ON portrait_revisions(user_id);

-- Enable RLS
ALTER TABLE portrait_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can manage revisions linked to their original portraits)
CREATE POLICY "Users can view their own portrait revisions" 
    ON public.portrait_revisions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert revisions for their portraits" 
    ON public.portrait_revisions FOR INSERT 
    WITH CHECK (auth.uid() = user_id AND 
                EXISTS (SELECT 1 FROM portraits p WHERE p.id = original_portrait_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can update their own revisions" 
    ON public.portrait_revisions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revisions" 
    ON public.portrait_revisions FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_portrait_revisions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portrait_revisions_updated_at
BEFORE UPDATE ON portrait_revisions
FOR EACH ROW
 