-- Add tags column to portraits table
ALTER TABLE public.portraits 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add comment for the new column
COMMENT ON COLUMN public.portraits.tags IS 'User-defined tags for organizing portraits';

-- Create a GIN index for efficient searching within the tags array
CREATE INDEX IF NOT EXISTS idx_portraits_tags ON public.portraits USING GIN (tags); 