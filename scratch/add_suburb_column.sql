-- Run this SQL in your Supabase SQL Editor to add the suburb column to your properties table

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS suburb TEXT;

-- If you want to migrate existing province data to suburbs:
-- UPDATE properties SET suburb = province WHERE suburb IS NULL;
