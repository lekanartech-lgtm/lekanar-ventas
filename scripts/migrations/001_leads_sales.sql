-- ============================================
-- SGC ISP - Database Schema
-- WIN Partner Sales Management System
-- ============================================

-- Drop existing types if they exist (for clean re-runs)
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE lead_status AS ENUM ('new', 'ready', 'converted');

CREATE TYPE address_type AS ENUM ('home', 'multifamily', 'condo');

CREATE TYPE request_status AS ENUM (
  'pending',
  'validated',
  'cancelled',
  'rejected',
  'rescue'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'scheduled',
  'executed',
  'rescue',
  'cancelled'
);

CREATE TYPE document_type AS ENUM (
  'dni_front',
  'dni_back',
  'utility_bill',
  'voice_contract'
);

-- ============================================
-- PLANS TABLE (Catalog)
-- ============================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  speed_mbps INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  commission DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REFERRAL SOURCES TABLE (Configurable)
-- ============================================

CREATE TABLE IF NOT EXISTS referral_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name VARCHAR(255) NOT NULL,
  dni VARCHAR(8) NOT NULL,
  phone VARCHAR(15) NOT NULL,

  contact_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contact_time_preference VARCHAR(50),
  referral_source_id UUID REFERENCES referral_sources(id),
  current_operator VARCHAR(50),
  notes TEXT,

  status lead_status NOT NULL DEFAULT 'new',

  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  full_name VARCHAR(255) NOT NULL,
  dni VARCHAR(8) NOT NULL,
  dni_expiry_date DATE NOT NULL,
  birth_place VARCHAR(100),
  birth_date DATE,
  email VARCHAR(255),
  phone VARCHAR(15) NOT NULL,

  phone_owner_name VARCHAR(255),
  phone_owner_dni VARCHAR(8),

  address TEXT NOT NULL,
  address_type address_type NOT NULL,
  reference TEXT,
  district VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'Lima',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  plan_id UUID NOT NULL REFERENCES plans(id),
  price DECIMAL(10, 2) NOT NULL,

  score INTEGER CHECK (score >= 0 AND score <= 999),
  installation_date DATE,
  winforce_id VARCHAR(50),
  contract_number VARCHAR(50),

  request_status request_status NOT NULL DEFAULT 'pending',
  order_status order_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,

  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  validated_by TEXT REFERENCES "user"(id),
  validated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALE DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sale_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_dni ON leads(dni);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_lead_id ON sales(lead_id);
CREATE INDEX idx_sales_request_status ON sales(request_status);
CREATE INDEX idx_sales_order_status ON sales(order_status);
CREATE INDEX idx_sales_dni ON sales(dni);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);

CREATE INDEX idx_sale_documents_sale_id ON sale_documents(sale_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO plans (name, speed_mbps, price, commission) VALUES
  ('Internet 200 Mbps', 200, 69.90, 30.00),
  ('Internet 400 Mbps', 400, 89.90, 40.00),
  ('Internet 600 Mbps', 600, 109.90, 50.00),
  ('Internet 1000 Mbps', 1000, 129.90, 60.00)
ON CONFLICT DO NOTHING;

INSERT INTO referral_sources (name) VALUES
  ('Facebook'),
  ('Instagram'),
  ('TikTok'),
  ('Referido'),
  ('Volante'),
  ('Llamada'),
  ('Visita en campo'),
  ('WhatsApp'),
  ('Otro')
ON CONFLICT DO NOTHING;
