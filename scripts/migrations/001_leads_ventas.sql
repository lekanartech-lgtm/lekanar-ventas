-- Enum para estados de lead
CREATE TYPE lead_status AS ENUM ('nuevo', 'contactado', 'interesado', 'no_interesado', 'convertido');

-- Enum para estados de venta
CREATE TYPE venta_status AS ENUM ('pendiente', 'en_proceso', 'instalado', 'rechazado', 'cancelado');

-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos del cliente
  nombre VARCHAR(255) NOT NULL,
  dni VARCHAR(8) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  operador_actual VARCHAR(50),
  observaciones TEXT,

  -- Estado y seguimiento
  status lead_status NOT NULL DEFAULT 'nuevo',
  fecha_contacto TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Relación con asesor (propietario)
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia al lead original
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE RESTRICT,

  -- Datos del cliente (copiados/extendidos del lead)
  nombre VARCHAR(255) NOT NULL,
  dni VARCHAR(8) NOT NULL,
  dni_fecha_caducidad DATE NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(255),

  -- Dirección
  direccion TEXT NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL DEFAULT 'Lima',
  referencia TEXT,

  -- Coordenadas GPS
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),

  -- Plan contratado
  plan VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,

  -- Evaluación crediticia
  score INTEGER CHECK (score >= 0 AND score <= 1000),

  -- Fechas
  fecha_instalacion DATE,

  -- Archivos (URLs)
  dni_frontal_url TEXT,
  dni_reverso_url TEXT,
  recibo_url TEXT,

  -- Estado
  status venta_status NOT NULL DEFAULT 'pendiente',

  -- Relación con asesor
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_dni ON leads(dni);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX idx_ventas_user_id ON ventas(user_id);
CREATE INDEX idx_ventas_lead_id ON ventas(lead_id);
CREATE INDEX idx_ventas_status ON ventas(status);
CREATE INDEX idx_ventas_dni ON ventas(dni);
CREATE INDEX idx_ventas_created_at ON ventas(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at
  BEFORE UPDATE ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
