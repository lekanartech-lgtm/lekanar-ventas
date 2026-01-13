-- ============================================
-- SGC ISP - Add state_id to districts
-- Migration 005
-- ============================================

-- Add state_id column to districts
ALTER TABLE districts ADD COLUMN IF NOT EXISTS state_id CHAR(2) REFERENCES states(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);

-- Update existing districts to set state_id from city's state_id
UPDATE districts d
SET state_id = c.state_id
FROM cities c
WHERE d.city_id = c.id
  AND d.state_id IS NULL;
