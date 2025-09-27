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

-- Add project status column for closure functionality
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
  CHECK (status IN ('active', 'completed', 'archived'));

-- Add index for project status filtering
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_org_status_idx ON projects(org_id, status);

-- Add last_activity_date to track inactivity for auto-close
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update RLS policies to handle new fields
-- (The existing RLS policies should already cover these new columns)