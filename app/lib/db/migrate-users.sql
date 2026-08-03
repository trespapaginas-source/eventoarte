-- Migración multi-usuario: 3 usuarios + settings de marca.
-- Idempotente: ON CONFLICT DO NOTHING (no sobreescribe existentes).
-- Contraseña temporal para los 3: recuerdos2026 (el admin la resetea después).

INSERT INTO users (name, email, password_hash, role, active) VALUES
  ('Administrador', 'admin@recuerdos.store', 'pbkdf2$100000$Z2rR6TTrLHTyhWKbiPS2Tg==$Ndp8SnA2YOL4e1vlgQroeuVcTKfvLRqfhYvYNWRc8jc=', 'admin', 1),
  ('Recordarte', 'recordarte@recuerdos.store', 'pbkdf2$100000$QUuzSI4B0geALcJXP64XCA==$0elQ5OT95pKykXU4pAkIRRtjxavCFwIdiU6BmQZ4/bc=', 'recordarte', 1),
  ('Bella Arte', 'bellaarte@recuerdos.store', 'pbkdf2$100000$Puzc0RF7ymqSGftNfmYm6w==$6noZmdQ/5E6KnnIVqFeya0cOHdn4YsuZnrmGgP2yfyw=', 'bellaarte', 1)
ON CONFLICT(email) DO NOTHING;

-- Settings de marca (defaults conocidos; el CMS los sobreescribe).
-- brand.default = qué marca se sirve en la raíz.
INSERT INTO settings (key, value) VALUES
  ('brand.default', 'bellaarte'),
  ('brand.bellaarte.whatsapp', '573102737264'),
  ('brand.bellaarte.instagram', 'https://instagram.com/bellaarte.co/'),
  ('brand.recordarte.whatsapp', '573122737264'),
  ('brand.recordarte.instagram', 'https://instagram.com/recordartebq/')
ON CONFLICT(key) DO NOTHING;
