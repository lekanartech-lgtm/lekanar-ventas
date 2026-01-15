-- ============================================
-- SGC ISP - Multi-Operator & Multi-Agency Support
-- Migration 002
-- ============================================

-- ============================================
-- OPERATORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENCIES TABLE
-- ============================================

create table agencies (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    address varchar(100),
    district_id char(6) references districts(id),
    city_id char(4) references cities(id),
    state_id char(2) references states(id),
    country_id char(2) references countries(id),
    is_active boolean default true,
    created_at timestamptz default now()
);

-- ============================================
-- SUPERVISOR-ADVISORS RELATIONSHIP TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS supervisor_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  advisor_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supervisor_id, advisor_id),
  CHECK (supervisor_id != advisor_id)
);

-- ============================================
-- MODIFY EXISTING TABLES
-- ============================================

-- Add agency_id to users
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id);

-- Add operator_id to plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES operators(id);

-- Add operator_id to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES operators(id);

-- Add operator_id to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES operators(id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_operators_code ON operators(code);
CREATE INDEX IF NOT EXISTS idx_operators_is_active ON operators(is_active);

CREATE INDEX IF NOT EXISTS idx_agencies_is_active ON agencies(is_active);

CREATE INDEX IF NOT EXISTS idx_user_agency_id ON "user"(agency_id);

CREATE INDEX IF NOT EXISTS idx_plans_operator_id ON plans(operator_id);

CREATE INDEX IF NOT EXISTS idx_leads_operator_id ON leads(operator_id);

CREATE INDEX IF NOT EXISTS idx_sales_operator_id ON sales(operator_id);

CREATE INDEX IF NOT EXISTS idx_supervisor_advisors_supervisor_id ON supervisor_advisors(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_advisors_advisor_id ON supervisor_advisors(advisor_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_operators_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert operators
INSERT INTO operators (name, code) VALUES
  ('WIN', 'win'),
  ('Mi Fibra', 'mifibra')
ON CONFLICT (code) DO NOTHING;

-- Insert agencies
INSERT INTO agencies (name, city) VALUES
  ('Lima', 'Lima'),
  ('Arequipa', 'Arequipa'),
  ('Cusco', 'Cusco')
ON CONFLICT (name) DO NOTHING;

-- Migrate existing plans to WIN operator
UPDATE plans
SET operator_id = (SELECT id FROM operators WHERE code = 'win')
WHERE operator_id IS NULL;

-- Migrate existing leads to WIN operator
UPDATE leads
SET operator_id = (SELECT id FROM operators WHERE code = 'win')
WHERE operator_id IS NULL;

-- Migrate existing sales to WIN operator
UPDATE sales
SET operator_id = (SELECT id FROM operators WHERE code = 'win')
WHERE operator_id IS NULL;
