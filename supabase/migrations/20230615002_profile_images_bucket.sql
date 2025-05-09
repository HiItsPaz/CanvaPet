-- Create a storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('profile-images', 'profile-images', true, false)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security for the storage bucket
-- This policy allows users to view any profile image (public access)
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-images');

-- This policy allows a user to upload images only to their own folder
CREATE POLICY "Users can upload images to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- This policy allows a user to update and delete only their own images
CREATE POLICY "Users can update and delete their own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
); 