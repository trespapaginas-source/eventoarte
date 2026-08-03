-- Migración multi-marca: banner superior editable + cinta promocional.
-- Idempotente: ON CONFLICT DO NOTHING (no sobreescribe valores existentes).
-- Defaults: banner activo con el texto actual; cinta inactiva hasta editarla.

INSERT INTO settings (key, value) VALUES
  ('banner.top.text', 'Fabricación Nacional · Personalización para cada celebración'),
  ('banner.top.active', 'true'),
  ('banner.top.link', ''),
  ('promo.text', ''),
  ('promo.active', 'false')
ON CONFLICT(key) DO NOTHING;
