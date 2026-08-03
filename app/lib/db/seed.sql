-- Seed inicial de eventoarte.co — categorías y ocasiones.
-- Aplicar con: npm run db:seed:local
-- (Los productos de muestra se gestionan desde el CMS en la Fase 3.)

-- ====== Categorías (por tipo de producto) ======
INSERT INTO categories (name, slug, description, sort_order, active) VALUES
  ('Morrales y kits', 'morrales-y-kits', 'Morrales y kits personalizados para niños y eventos.', 1, 1),
  ('Loncheras', 'loncheras', 'Loncheras térmicas personalizadas.', 2, 1),
  ('Tulas', 'tulas', 'Tulas de lona para regalos y eventos.', 3, 1),
  ('Cangureras', 'cangureras', 'Cangureras pequeñas para repartir en la fiesta.', 4, 1),
  ('Piñatería', 'pinateria', 'Piñatería y elementos de decoración.', 5, 1),
  ('Recordatorios', 'recordatorios', 'Cajas, bolsitas y etiquetas de recuerdo.', 6, 1);

-- ====== Ocasiones ======
INSERT INTO occasions (name, slug, icon, sort_order, active) VALUES
  ('Cumpleaños', 'cumpleanos', '🎂', 1, 1),
  ('Baby shower', 'baby-shower', '🍼', 2, 1),
  ('Quinceaños', 'quinceanos', '👑', 3, 1),
  ('Bautizos y primeras comuniones', 'bautizos', '✝️', 4, 1),
  ('Bodas', 'bodas', '💍', 5, 1);

-- ====== Settings globales ======
INSERT INTO settings (key, value) VALUES
  ('site.whatsapp', '573000000000'),
  ('site.instagram', 'https://instagram.com/eventoarte.co'),
  ('site.public_url', 'https://eventoarte.co'),
  ('seo.default_title', 'eventoarte.co — Recordatorios personalizados para eventos'),
  ('seo.default_desc', 'Morrales, loncheras, kits y recordatorios personalizados para celebrar tus momentos. Hecho en Colombia.'),
  ('footer.text', 'Recordatorios y productos personalizados para celebrar tus momentos. Hecho en Colombia.');
