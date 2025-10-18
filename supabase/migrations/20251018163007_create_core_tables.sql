/*
  # Create Chef SES Core Tables

  ## Overview
  This migration creates the core tables for the Chef SES multi-site canteen management system.
  
  ## New Tables
  
  ### 1. groups
  - Central organization managing multiple sites (e.g., "Vulpia Group")
  - Fields: name, code, contact_email, settings (JSONB), subscription info
  - Manages overall configuration and site limits
  
  ### 2. sites
  - Individual establishments (EHPAD, hospitals, schools, etc.)
  - Links to parent group
  - Fields: site_name, type, address, contact, managers, sync settings
  - Tracks synchronization status with central menus
  
  ### 3. users (extends Supabase auth.users)
  - User accounts with role-based access
  - Supports multiple roles: GROUP_ADMIN, SITE_MANAGER, CHEF, NUTRITIONIST, SUPPLIER
  - Links to group and/or site for access control
  
  ### 4. residents
  - People living in establishments (EHPAD, retirement homes)
  - Comprehensive nutritional profiles with allergies, intolerances, dietary restrictions
  - Medical conditions and texture preferences
  - Emergency contact information
  
  ### 5. recipes
  - Recipe database with nutritional information
  - Filtering by diet, allergies, pathologies, texture
  - Supports AI-generated recipes
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access based on user's group/site membership
  - Users can only access data within their authorized scope
  
  ## Important Notes
  - All timestamps use timestamptz for proper timezone handling
  - JSONB fields used for flexible nested data (nutritional profiles, addresses)
  - Indexes created for common query patterns
  - Foreign key constraints ensure data integrity
*/

-- Create ENUM types
CREATE TYPE establishment_type AS ENUM (
  'ehpad', 
  'hopital', 
  'ecole', 
  'collectivite', 
  'resto', 
  'maison_retraite',
  'cantine_entreprise'
);

CREATE TYPE user_role AS ENUM (
  'GROUP_ADMIN',
  'SITE_MANAGER', 
  'CHEF',
  'NUTRITIONIST',
  'SUPPLIER',
  'VIEWER'
);

CREATE TYPE sync_mode AS ENUM ('auto', 'manual');
CREATE TYPE sync_status AS ENUM ('synced', 'pending', 'error', 'local_override');
CREATE TYPE resident_status AS ENUM ('actif', 'inactif', 'sorti', 'décédé');
CREATE TYPE severity_level AS ENUM ('légère', 'modérée', 'sévère', 'critique');
CREATE TYPE texture_type AS ENUM ('normale', 'mixée', 'hachée', 'liquide', 'purée');

-- 1. GROUPS TABLE
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  settings JSONB DEFAULT '{
    "defaultSyncMode": "auto",
    "weekStart": "monday",
    "timezone": "Europe/Paris",
    "currency": "EUR"
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  subscription JSONB DEFAULT '{
    "plan": "basic",
    "maxSites": 50
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SITES TABLE
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  type establishment_type NOT NULL,
  address JSONB DEFAULT '{}'::jsonb,
  contact JSONB DEFAULT '{}'::jsonb,
  managers UUID[] DEFAULT ARRAY[]::UUID[],
  sync_mode sync_mode DEFAULT 'auto',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{
    "timezone": "Europe/Paris",
    "capacity": {"lunch": 100, "dinner": 50}
  }'::jsonb,
  last_sync_at TIMESTAMPTZ,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, site_name)
);

-- 3. USERS TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  roles user_role[] DEFAULT ARRAY[]::user_role[],
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  business_name TEXT,
  establishment_type establishment_type,
  vat_number TEXT,
  siret TEXT,
  legal_form TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  website TEXT,
  description TEXT,
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RESIDENTS TABLE
CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  room_number TEXT,
  bed_number TEXT,
  medical_record_number TEXT,
  
  -- Nutritional profile (stored as JSONB for flexibility)
  nutritional_profile JSONB DEFAULT '{
    "allergies": [],
    "intolerances": [],
    "dietaryRestrictions": [],
    "medicalConditions": [],
    "nutritionalNeeds": {},
    "texturePreferences": {"consistency": "normale", "difficulty": "aucune"},
    "hydration": {},
    "foodPreferences": {}
  }'::jsonb,
  
  -- Emergency contact
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  
  status resident_status DEFAULT 'actif',
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  last_updated_by UUID REFERENCES public.users(id),
  general_notes TEXT,
  modification_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RECIPES TABLE
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT[],
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 4,
  difficulty TEXT,
  
  -- Filtering attributes
  diet TEXT[],
  allergens TEXT[],
  pathologies TEXT[],
  texture texture_type DEFAULT 'normale',
  establishment_types establishment_type[],
  
  -- Nutritional info
  nutrition JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  is_ai_generated BOOLEAN DEFAULT false,
  compatibility_score DECIMAL(3,2),
  image_url TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MENUS TABLE
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  year_week TEXT NOT NULL,
  label TEXT,
  entries JSONB DEFAULT '[]'::jsonb,
  is_synced BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. STOCKS TABLE
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_quantity DECIMAL(10,2),
  expiration_date DATE,
  supplier TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  products JSONB DEFAULT '[]'::jsonb,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  order_date TIMESTAMPTZ DEFAULT now(),
  delivery_date DATE,
  status TEXT DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_group_id ON sites(group_id);
CREATE INDEX IF NOT EXISTS idx_sites_type ON sites(type);
CREATE INDEX IF NOT EXISTS idx_users_group_id ON public.users(group_id);
CREATE INDEX IF NOT EXISTS idx_users_site_id ON public.users(site_id);
CREATE INDEX IF NOT EXISTS idx_residents_site_id ON residents(site_id);
CREATE INDEX IF NOT EXISTS idx_residents_group_id ON residents(group_id);
CREATE INDEX IF NOT EXISTS idx_residents_status ON residents(status);
CREATE INDEX IF NOT EXISTS idx_recipes_diet ON recipes USING GIN(diet);
CREATE INDEX IF NOT EXISTS idx_recipes_allergens ON recipes USING GIN(allergens);
CREATE INDEX IF NOT EXISTS idx_recipes_establishment_types ON recipes USING GIN(establishment_types);
CREATE INDEX IF NOT EXISTS idx_menus_group_id ON menus(group_id);
CREATE INDEX IF NOT EXISTS idx_menus_site_id ON menus(site_id);
CREATE INDEX IF NOT EXISTS idx_menus_year_week ON menus(year_week);
CREATE INDEX IF NOT EXISTS idx_stocks_site_id ON stocks(site_id);
CREATE INDEX IF NOT EXISTS idx_orders_site_id ON orders(site_id);

-- Enable Row Level Security on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Groups: Only group admins can access their group
CREATE POLICY "Users can view their own group"
  ON groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Group admins can update their group"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM public.users 
      WHERE id = auth.uid() AND 'GROUP_ADMIN' = ANY(roles)
    )
  );

-- Sites: Users can only access sites in their group
CREATE POLICY "Users can view sites in their group"
  ON sites FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage sites"
  ON sites FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.users 
      WHERE id = auth.uid() AND 'GROUP_ADMIN' = ANY(roles)
    )
  );

-- Users: Can view their own data
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Residents: Access based on site/group membership
CREATE POLICY "Users can view residents in their group"
  ON residents FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Site managers can insert residents"
  ON residents FOR INSERT
  TO authenticated
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM public.users 
      WHERE id = auth.uid() AND 'GROUP_ADMIN' = ANY(roles)
    )
  );

CREATE POLICY "Site managers can update residents"
  ON residents FOR UPDATE
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM public.users 
      WHERE id = auth.uid() AND 'GROUP_ADMIN' = ANY(roles)
    )
  )
  WITH CHECK (
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM public.users 
      WHERE id = auth.uid() AND 'GROUP_ADMIN' = ANY(roles)
    )
  );

-- Recipes: Everyone can view, authenticated users can create
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Menus: Access based on group/site
CREATE POLICY "Users can view menus in their group or site"
  ON menus FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.users WHERE id = auth.uid()
    ) OR
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage menus"
  ON menus FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.users 
      WHERE id = auth.uid() AND 'GROUP_ADMIN' = ANY(roles)
    )
  );

-- Stocks: Site-specific access
CREATE POLICY "Users can view stocks in their site"
  ON stocks FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Site users can manage stocks"
  ON stocks FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Suppliers: Group/Site access
CREATE POLICY "Users can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.users WHERE id = auth.uid()
    ) OR
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Orders: Site-specific access
CREATE POLICY "Users can view orders in their site"
  ON orders FOR SELECT
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Site users can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    site_id IN (
      SELECT site_id FROM public.users WHERE id = auth.uid()
    )
  );