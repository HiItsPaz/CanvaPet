-- Create a new bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) policy
-- Users can upload and modify their own photos
CREATE POLICY "Users can upload their own pet photos"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'pet-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update and delete their own photos
CREATE POLICY "Users can update their own pet photos"
ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'pet-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own pet photos"
ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'pet-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Everyone can view public pet photos
CREATE POLICY "Public pet photos are viewable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pet-photos');

-- Allow uploads up to 10MB (measured in bytes)
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'pet-photos'; 