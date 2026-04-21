-- Run this in your Supabase SQL Editor

-- 1. Add status column to properties (for occupied/available toggle)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- 2. Add avatar_url column to profiles (for profile photo upload)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Add phone column to profiles if missing
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;
