-- Comprehensive Row Level Security (RLS) Policies for SiteRecap
-- This ensures users can only access their own data and organizations

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update own organizations" ON organizations;
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;

DROP POLICY IF EXISTS "Users can view own organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can insert organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can update organization memberships" ON organization_members;

DROP POLICY IF EXISTS "Users can view organization projects" ON projects;
DROP POLICY IF EXISTS "Users can insert organization projects" ON projects;
DROP POLICY IF EXISTS "Users can update organization projects" ON projects;
DROP POLICY IF EXISTS "Users can delete organization projects" ON projects;

DROP POLICY IF EXISTS "Users can view project photos" ON photos;
DROP POLICY IF EXISTS "Users can insert project photos" ON photos;
DROP POLICY IF EXISTS "Users can update project photos" ON photos;
DROP POLICY IF EXISTS "Users can delete project photos" ON photos;

DROP POLICY IF EXISTS "Users can view project reports" ON reports;
DROP POLICY IF EXISTS "Users can insert project reports" ON reports;
DROP POLICY IF EXISTS "Users can update project reports" ON reports;
DROP POLICY IF EXISTS "Users can delete project reports" ON reports;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- PROFILES table policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS table policies
CREATE POLICY "Users can view own organizations"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own organizations"
ON organizations FOR UPDATE
USING (
  id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can insert organizations"
ON organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ORGANIZATION_MEMBERS table policies
CREATE POLICY "Users can view own organization memberships"
ON organization_members FOR SELECT
USING (
  user_id = auth.uid() OR 
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can insert organization memberships"
ON organization_members FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can update organization memberships"
ON organization_members FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- PROJECTS table policies
CREATE POLICY "Users can view organization projects"
ON projects FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert organization projects"
ON projects FOR INSERT
WITH CHECK (
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update organization projects"
ON projects FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete organization projects"
ON projects FOR DELETE
USING (
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- PHOTOS table policies
CREATE POLICY "Users can view project photos"
ON photos FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert project photos"
ON photos FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update project photos"
ON photos FOR UPDATE
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete project photos"
ON photos FOR DELETE
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid()
  )
);

-- REPORTS table policies
CREATE POLICY "Users can view project reports"
ON reports FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert project reports"
ON reports FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update project reports"
ON reports FOR UPDATE
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete project reports"
ON reports FOR DELETE
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.org_id = om.org_id
    WHERE om.user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- SUBSCRIPTIONS table policies
CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own subscriptions"
ON subscriptions FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Create function to automatically create organization and membership on first login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  
  -- Create a default organization for the user
  INSERT INTO public.organizations (id, name, plan, created_at, updated_at)
  VALUES (new.id, 'My Organization', 'starter', now(), now());
  
  -- Add user as owner of their organization
  INSERT INTO public.organization_members (org_id, user_id, role, created_at)
  VALUES (new.id, new.id, 'owner', now());
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.organization_members TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.photos TO authenticated;
GRANT ALL ON public.reports TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;

-- Additional security: Ensure users can only access their own data
-- This creates a security context that filters all queries automatically
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE organization_members FORCE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE photos FORCE ROW LEVEL SECURITY;
ALTER TABLE reports FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;