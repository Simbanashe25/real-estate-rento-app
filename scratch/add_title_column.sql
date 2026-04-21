-- Run this SQL in your Supabase SQL Editor to add the title column to your properties table

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS title TEXT;

-- If you want to backfill existing properties with a default title based on their address:
UPDATE properties 
SET title = split_part(address, ',', 1) 
WHERE title IS NULL;
