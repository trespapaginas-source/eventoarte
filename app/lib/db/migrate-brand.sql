-- Migración de marca: eventoarte.co → recuerdos.store
-- Idempotente: solo actualiza valores que aún contengan la marca anterior.
UPDATE settings SET value = 'https://instagram.com/recuerdos.store' WHERE key = 'site.instagram';
UPDATE settings SET value = 'https://recuerdos.store' WHERE key = 'site.public_url';
UPDATE settings SET value = 'recuerdos.store — Recordatorios personalizados para eventos' WHERE key = 'seo.default_title';
