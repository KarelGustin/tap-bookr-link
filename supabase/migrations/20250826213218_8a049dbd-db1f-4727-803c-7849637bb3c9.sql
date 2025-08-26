-- Fix storage RLS policies for media bucket
-- Allow users to upload their own media files

-- Create policies for media bucket
CREATE POLICY "Users can upload their own media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Also update avatar bucket policies to be consistent
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);