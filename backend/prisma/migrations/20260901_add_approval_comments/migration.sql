-- Add approvalComment field to listings table (for manager approval feedback)
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "approvalComment" TEXT;

-- Add approvalComment field to market_items table
ALTER TABLE "market_items" ADD COLUMN IF NOT EXISTS "approvalComment" TEXT;

-- Add approvalComment field to service_providers table
ALTER TABLE "service_providers" ADD COLUMN IF NOT EXISTS "approvalComment" TEXT;

-- Add approvalComment field to jobs table
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "approvalComment" TEXT;
