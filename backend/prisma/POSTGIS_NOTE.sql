-- Run this manually after `prisma migrate dev` (Prisma has no native GEOGRAPHY type).
-- 1. Enable PostGIS on your database once:
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add generated geography columns for fast radius search ("near me", FR16):
ALTER TABLE listings
  ADD COLUMN public_geog geography(Point, 4326)
  GENERATED ALWAYS AS (ST_MakePoint(public_lng, public_lat)::geography) STORED;

ALTER TABLE listings
  ADD COLUMN private_geog geography(Point, 4326)
  GENERATED ALWAYS AS (ST_MakePoint(private_lng, private_lat)::geography) STORED;

-- 3. Spatial index for fast "within radius" queries:
CREATE INDEX idx_listings_public_geog ON listings USING GIST (public_geog);

-- 4. Example "near me" query (radius in meters), used by /api/listings/search:
-- SELECT id, price, category
-- FROM listings
-- WHERE status = 'PUBLISHED'
--   AND ST_DWithin(public_geog, ST_MakePoint($lng, $lat)::geography, $radiusMeters);
