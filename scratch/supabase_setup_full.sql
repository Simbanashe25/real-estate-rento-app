-- Run this in your Supabase SQL Editor

-- 1. TABLES SETUP -----------------------------------------

-- Add avatar_url, phone to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add status column to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';


-- 2. STORAGE POLICIES ------------------------------------
-- Assuming your bucket name is 'property-images'

-- If you don't have the bucket, please create it manually first 
-- in the Supabase Dashboard under 'Storage' with name 'property-images'
-- and make sure it is PUBLIC.

-- Policy: Allow users to view all files
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'property-images' );

-- Policy: Allow authenticated users to upload their own files
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'property-images' );

-- Policy: Allow users to update their own files (for profile pics)
CREATE POLICY "Update Own Files" 
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'property-images' AND auth.uid() = owner );

-- Policy: Allow users to delete their own files
CREATE POLICY "Delete Own Files" 
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'property-images' AND auth.uid() = owner );
