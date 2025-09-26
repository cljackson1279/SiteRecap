-- Enhanced SiteRecap Database Schema with Owner/GC Contacts and Organization Branding

-- Add Owner/GC contact fields to existing projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gc_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gc_email TEXT;

-- Add branding fields to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#168995';

-- Add useful indexes for performance
CREATE INDEX IF NOT EXISTS projects_org_name_idx ON projects(org_id, name);
CREATE INDEX IF NOT EXISTS projects_owner_email_idx ON projects(owner_email) WHERE owner_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS projects_gc_email_idx ON projects(gc_email) WHERE gc_email IS NOT NULL;

-- Update RLS policies to handle new fields
-- (The existing RLS policies should already cover these new columns)