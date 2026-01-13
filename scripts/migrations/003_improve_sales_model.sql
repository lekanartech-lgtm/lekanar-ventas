-- ============================================
-- SGC ISP - Improve Sales Model
-- Migration 003
-- ============================================
--
-- Changes:
-- 1. Rename winforce_id to external_id (operator-agnostic)
-- 2. Add operator_metadata JSONB for operator-specific data
-- 3. Create document_types table (configurable per operator)
-- 4. Update sale_documents to reference document_types
-- ============================================

-- Step 1: Rename winforce_id to external_id
ALTER TABLE sales RENAME COLUMN winforce_id TO external_id;

-- Step 2: Add operator_metadata JSONB column
ALTER TABLE sales ADD COLUMN IF NOT EXISTS operator_metadata JSONB DEFAULT '{}';

-- Step 3: Create document_types table
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, code)
);

-- Step 4: Add document_type_id to sale_documents
ALTER TABLE sale_documents ADD COLUMN IF NOT EXISTS document_type_id UUID REFERENCES document_types(id);

-- Step 5: Seed document types for WIN operator
INSERT INTO document_types (operator_id, code, name, is_required, display_order)
SELECT
  o.id,
  dt.code,
  dt.name,
  dt.is_required,
  dt.display_order
FROM operators o
CROSS JOIN (VALUES
  ('dni_front', 'DNI Frontal', true, 1),
  ('dni_back', 'DNI Reverso', true, 2),
  ('utility_bill', 'Recibo de Servicios', true, 3),
  ('facade_photo', 'Foto de Fachada', false, 4),
  ('voice_contract', 'Contrato de Voz', false, 5)
) AS dt(code, name, is_required, display_order)
WHERE o.code = 'win'
ON CONFLICT (operator_id, code) DO NOTHING;

-- Step 6: Seed document types for Mi Fibra operator
INSERT INTO document_types (operator_id, code, name, is_required, display_order)
SELECT
  o.id,
  dt.code,
  dt.name,
  dt.is_required,
  dt.display_order
FROM operators o
CROSS JOIN (VALUES
  ('dni_front', 'DNI Frontal', true, 1),
  ('dni_back', 'DNI Reverso', true, 2),
  ('utility_bill', 'Recibo de Luz/Agua', true, 3),
  ('address_proof', 'Comprobante de Domicilio', false, 4)
) AS dt(code, name, is_required, display_order)
WHERE o.code = 'mifibra'
ON CONFLICT (operator_id, code) DO NOTHING;

-- Step 7: Migrate existing sale_documents to use document_type_id
UPDATE sale_documents sd
SET document_type_id = dt.id
FROM document_types dt
JOIN operators o ON dt.operator_id = o.id
JOIN sales s ON sd.sale_id = s.id
WHERE o.code = 'win'
  AND sd.type::text = dt.code
  AND sd.document_type_id IS NULL;

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_document_types_operator_id ON document_types(operator_id);
CREATE INDEX IF NOT EXISTS idx_sale_documents_document_type_id ON sale_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_sales_external_id ON sales(external_id) WHERE external_id IS NOT NULL;
