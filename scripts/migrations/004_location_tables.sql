-- ============================================
-- SGC ISP - Location Tables (Countries, States, Cities, Districts)
-- Migration 004
-- ============================================
--
-- Uses UBIGEO codes as primary keys:
-- - countries: CHAR(2) - e.g., "PE" for Peru
-- - states (departamentos): CHAR(2) - e.g., "15" for Lima
-- - cities (provincias): CHAR(4) - e.g., "1501" for Lima province
-- - districts (distritos): CHAR(6) - e.g., "150101" for Lima district
-- ============================================

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id CHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- States table (Departamentos)
CREATE TABLE IF NOT EXISTS states (
  id CHAR(2) PRIMARY KEY,
  country_id CHAR(2) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Cities table (Provincias)
CREATE TABLE IF NOT EXISTS cities (
  id CHAR(4) PRIMARY KEY,
  state_id CHAR(2) NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Districts table (Distritos)
CREATE TABLE IF NOT EXISTS districts (
  id CHAR(6) PRIMARY KEY,
  city_id CHAR(4) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);

-- Seed Peru
INSERT INTO countries (id, name) VALUES ('PE', 'Perú')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Update leads table to add address fields
-- ============================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS district_id CHAR(6) REFERENCES districts(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS reference TEXT;

-- Index for district lookups
CREATE INDEX IF NOT EXISTS idx_leads_district_id ON leads(district_id);

-- ============================================
-- Update sales table to use district_id instead of text fields
-- ============================================

ALTER TABLE sales ADD COLUMN IF NOT EXISTS district_id CHAR(6) REFERENCES districts(id);
CREATE INDEX IF NOT EXISTS idx_sales_district_id ON sales(district_id);
