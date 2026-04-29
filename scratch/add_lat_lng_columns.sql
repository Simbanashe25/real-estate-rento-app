-- Add lat and lng columns to properties table to support Mapbox coordinates
ALTER TABLE properties
ADD COLUMN lat NUMERIC(10, 7),
ADD COLUMN lng NUMERIC(10, 7);
