-- Run this SQL in your Supabase SQL Editor to add the available_from column to your properties table

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS available_from DATE DEFAULT CURRENT_DATE;

-- Optional: Set a default value for existing records
-- UPDATE properties SET available_from = CURRENT_DATE WHERE available_from IS NULL;
