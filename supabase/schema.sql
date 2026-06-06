-- Run this in your Supabase SQL Editor

-- Prospects table
CREATE TABLE IF NOT EXISTS prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  rating REAL,
  city TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'contacted', 'interested', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT DEFAULT '',
  contact_made BOOLEAN DEFAULT FALSE,
  last_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  type TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see their own data
DROP POLICY IF EXISTS "Users can manage their own prospects" ON prospects;
CREATE POLICY "Users can manage their own prospects"
  ON prospects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own search history" ON search_history;
CREATE POLICY "Users can manage their own search history"
  ON search_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MIGRATION: Add CRM fields (run after initial schema)
-- ============================================================
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS next_contact TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'Google Maps';

-- Update status constraint to include new CRM statuses
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_status_check;
UPDATE prospects SET status = 'new' WHERE status NOT IN ('new', 'contacted', 'replied', 'interested', 'not_interested', 'client', 'pending', 'closed');
ALTER TABLE prospects ADD CONSTRAINT prospects_status_check
  CHECK (status IN ('new', 'contacted', 'replied', 'interested', 'not_interested', 'client', 'pending', 'closed'));

-- ============================================================
-- MIGRATION: Pharmacy survey fields (run after CRM migration)
-- ============================================================
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS provincia TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS sistema_actual TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS precio_mensual_actual NUMERIC(10,2);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS cantidad_sucursales INTEGER DEFAULT 1;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS cantidad_puestos INTEGER DEFAULT 1;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS nivel_interes TEXT DEFAULT 'bajo'
  CHECK (nivel_interes IN ('bajo', 'medio', 'alto'));
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS estado_comercial TEXT DEFAULT 'sin_contactar'
  CHECK (estado_comercial IN ('sin_contactar', 'contactado', 'interesado', 'no_interesado', 'visita_agendada', 'cliente'));
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS problemas_detectados TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS observaciones TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS precio_estimado_recomendado NUMERIC(10,2);

-- ============================================================
-- MIGRATION: Commercial survey fields (run after pharmacy migration)
-- ============================================================
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS tipo_relevamiento TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS rubro TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS proveedor_actual TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS software_actual TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS factura_electronica BOOLEAN DEFAULT FALSE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS control_stock BOOLEAN DEFAULT FALSE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS usa_lector_codigo BOOLEAN DEFAULT FALSE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS usa_balanza BOOLEAN DEFAULT FALSE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS cantidad_cajas INTEGER DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS cantidad_empleados INTEGER DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS ventas_estimadas_mes NUMERIC(10,2);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS precio_actual_sistema NUMERIC(10,2);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS precio_objetivo NUMERIC(10,2);
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS interes_cambio TEXT DEFAULT '';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS fecha_visita DATE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS fecha_proximo_contacto DATE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS oportunidad_comercial TEXT DEFAULT 'media'
  CHECK (oportunidad_comercial IN ('alta', 'media', 'baja'));

-- Update estado_comercial constraint to include new states
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_estado_comercial_check;
UPDATE prospects SET estado_comercial = 'sin_contactar' WHERE estado_comercial NOT IN ('sin_contactar', 'contactado', 'interesado', 'no_interesado', 'visita_agendada', 'demo_agendada', 'propuesta_enviada', 'cliente');
ALTER TABLE prospects ADD CONSTRAINT prospects_estado_comercial_check
  CHECK (estado_comercial IN ('sin_contactar', 'contactado', 'interesado', 'no_interesado', 'visita_agendada', 'demo_agendada', 'propuesta_enviada', 'cliente'));

-- Update status constraint to include 'replied'
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_status_check;
UPDATE prospects SET status = 'new' WHERE status NOT IN ('new', 'contacted', 'replied', 'interested', 'not_interested', 'client', 'pending', 'closed');
ALTER TABLE prospects ADD CONSTRAINT prospects_status_check
  CHECK (status IN ('new', 'contacted', 'replied', 'interested', 'not_interested', 'client', 'pending', 'closed'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prospects_updated_at ON prospects;
CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
