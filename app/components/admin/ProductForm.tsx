import { useState, useRef } from "react";
import { Upload, X, Plus } from "lucide-react";
import { Field, TextArea, Select, TextInput } from "~/components/ui/Field";
import { Button } from "~/components/ui/Toggle";

/**
 * Formulario de producto (crear/editar) — mobile-first.
 * Maneja galería de imágenes (subida a R2 via /admin/upload),
 * todos los campos del producto y los toggles de visibilidad.
 */

export interface ExistingImage {
  id: number;
  r2Key: string;
  url: string;
  altText: string | null;
}

export interface ProductFormProps {
  product?: {
    name: string;
    slug: string;
    code: string;
    categoryId: number | null;
    shortDesc: string | null;
    longDesc: string | null;
    price: number;
    priceType: string;
    minQty: number;
    material: string | null;
    colors: string | null;
    dimensions: string | null;
    weight: string | null;
    leadTime: string | null;
    customization: string | null;
    active: boolean;
    featured: boolean;
    seoTitle: string | null;
    seoDesc: string | null;
  } | null;
  images: ExistingImage[];
  categories: { id: number; name: string }[];
}

export function ProductForm({ product, images: initialImages, categories }: ProductFormProps) {
  const [images, setImages] = useState<ExistingImage[]>(initialImages);
  const [colors, setColors] = useState<string[]>(parseColors(product?.colors));
  const [colorInput, setColorInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 6;
  const atLimit = images.length >= MAX_IMAGES;

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    // Solo tomamos las necesarias hasta llegar al máximo de 6
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setUploadError(`Máximo ${MAX_IMAGES} fotos por producto.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setUploadError(null);
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/admin/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { error?: string; key?: string; url?: string };
        if (!res.ok) {
          setUploadError(data.error ?? "Error al subir la imagen");
          setUploading(false);
          return;
        }
        const key: string | undefined = data.key;
        const url: string | undefined = data.url;
        if (!key || !url) {
          setUploadError("Respuesta inválida del servidor");
          setUploading(false);
          return;
        }
        const newImg: ExistingImage = { id: -Date.now(), r2Key: key, url, altText: null };
        setImages((prev) => [...prev, newImg]);
      } catch {
        setUploadError("Error de red al subir la imagen");
        setUploading(false);
        return;
      }
    }
    setUploading(false);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function addColor() {
    const v = colorInput.trim();
    if (v && !colors.includes(v)) setColors([...colors, v]);
    setColorInput("");
  }

  function removeColor(c: string) {
    setColors(colors.filter((x) => x !== c));
  }

  return (
    <div className="space-y-6">
      {/* ===== Galería ===== */}
      <Section title="Fotos">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div key={`${img.r2Key}-${idx}`} className="relative h-24 w-24 overflow-hidden border border-border">
              <img src={img.url} alt={img.altText ?? ""} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                aria-label="Quitar imagen"
                className="absolute right-1 top-1 bg-brand-ink/80 p-1 text-white"
              >
                <X size={12} strokeWidth={2} />
              </button>
              {idx === 0 ? (
                <span className="absolute bottom-0 left-0 right-0 bg-brand-ink/80 px-1 py-0.5 text-center text-[8px] uppercase tracking-wider text-white">
                  Principal
                </span>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={() => !atLimit && fileRef.current?.click()}
            disabled={uploading || atLimit}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 border border-dashed border-border text-brand-ink-light transition-colors hover:border-brand-ink hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-brand-ink-light"
          >
            {uploading ? (
              <span className="text-[10px]">Subiendo…</span>
            ) : atLimit ? (
              <>
                <span className="text-base font-bold text-brand-ink">6/6</span>
                <span className="text-[10px] uppercase tracking-wide">Máx.</span>
              </>
            ) : (
              <>
                <Upload size={18} strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-wide">Subir</span>
              </>
            )}
          </button>
        </div>
        {uploadError ? (
          <p className="mt-2 text-xs text-error">{uploadError}</p>
        ) : null}
        {/* Inputs ocultos con las claves R2 para que el action los reciba */}
        {images.map((img, idx) => (
          <input key={`img-${idx}`} type="hidden" name="images" value={img.r2Key} />
        ))}
        <p className="mt-2 text-[11px] text-brand-ink-light">
          Hasta {MAX_IMAGES} fotos · JPG, PNG o WEBP · Máx 5 MB · La primera es la principal ({images.length}/{MAX_IMAGES})
        </p>
      </Section>

      {/* ===== Datos básicos ===== */}
      <Section title="Datos del producto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" name="name" required>
            <TextInput name="name" defaultValue={product?.name} required placeholder="Morral Infantil Safari" />
          </Field>
          <Field label="Código" name="code" required>
            <TextInput name="code" defaultValue={product?.code} required placeholder="MAR-SAF-01" />
          </Field>
          <Field label="Slug (URL)" name="slug" required hint="Solo minúsculas, números y guiones">
            <TextInput name="slug" defaultValue={product?.slug} required placeholder="morral-infantil-safari" />
          </Field>
          <Field label="Categoría" name="categoryId">
            <Select name="categoryId" defaultValue={product?.categoryId ?? ""}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Descripción corta" name="shortDesc">
          <TextArea
            name="shortDesc"
            defaultValue={product?.shortDesc ?? ""}
            rows={2}
            placeholder="Morral de lona con temática safari, ideal para cumpleaños infantiles."
          />
        </Field>
        <Field label="Descripción larga" name="longDesc">
          <TextArea name="longDesc" defaultValue={product?.longDesc ?? ""} rows={4} />
        </Field>
      </Section>

      {/* ===== Precio ===== */}
      <Section title="Precio">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio (COP)" name="price" required>
            <TextInput name="price" type="number" defaultValue={product?.price ?? 0} required />
          </Field>
          <Field label="Tipo de precio" name="priceType">
            <Select name="priceType" defaultValue={product?.priceType ?? "desde"}>
              <option value="unitario">Precio único</option>
              <option value="desde">Desde</option>
              <option value="por_cantidad">Por cantidad</option>
            </Select>
          </Field>
          <Field label="Cantidad mínima" name="minQty" required>
            <TextInput name="minQty" type="number" defaultValue={product?.minQty ?? 1} required />
          </Field>
        </div>
      </Section>

      {/* ===== Especificaciones ===== */}
      <Section title="Especificaciones">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Material" name="material">
            <TextInput name="material" defaultValue={product?.material ?? ""} />
          </Field>
          <Field label="Medidas" name="dimensions">
            <TextInput name="dimensions" defaultValue={product?.dimensions ?? ""} placeholder="30 × 25 × 10 cm" />
          </Field>
          <Field label="Peso" name="weight">
            <TextInput name="weight" defaultValue={product?.weight ?? ""} placeholder="180 g" />
          </Field>
          <Field label="Tiempo de fabricación" name="leadTime">
            <TextInput name="leadTime" defaultValue={product?.leadTime ?? ""} placeholder="5-7 días hábiles" />
          </Field>
          <Field label="Personalización" name="customization">
            <TextInput name="customization" defaultValue={product?.customization ?? ""} />
          </Field>
        </div>

        {/* Colores (lista editable) */}
        <Field label="Colores disponibles" name="colors">
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-1 text-xs text-brand-ink-soft"
              >
                {c}
                <button type="button" onClick={() => removeColor(c)} className="text-brand-ink-light hover:text-error">
                  <X size={10} strokeWidth={2} />
                </button>
              </span>
            ))}
            <div className="flex gap-1">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                placeholder="Agregar color…"
                className="border border-border bg-surface px-2 py-1 text-xs focus:border-brand-ink focus:outline-none"
              />
              <button type="button" onClick={addColor} className="p-1 text-brand-ink-soft hover:text-brand-ink">
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          {/* Hidden input serializa los colores como JSON */}
          <input type="hidden" name="colors" value={JSON.stringify(colors)} />
        </Field>
      </Section>

      {/* ===== Visibilidad ===== */}
      <Section title="Visibilidad">
        <div className="space-y-3">
          <ToggleRow name="active" label="Activo (visible en el sitio)" defaultChecked={product?.active ?? true} />
          <ToggleRow name="featured" label="Destacado (aparece en el home)" defaultChecked={product?.featured ?? false} />
        </div>
      </Section>

      {/* ===== SEO (opcional) ===== */}
      <Section title="SEO (opcional)">
        <Field label="Título SEO" name="seoTitle">
          <TextInput name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
        </Field>
        <Field label="Descripción SEO" name="seoDesc">
          <TextArea name="seoDesc" defaultValue={product?.seoDesc ?? ""} rows={2} />
        </Field>
      </Section>
    </div>
  );
}

/* ---------- Helpers UI ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-surface p-4 md:p-6">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[1.5px] text-brand-ink">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-brand-ink">{label}</span>
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 rounded-full border border-border bg-surface-off transition-colors peer-checked:bg-brand-ink after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-surface after:transition-transform peer-checked:after:translate-x-5" />
      {/* Fallback value cuando el checkbox está desmarcado */}
      <input type="hidden" name={name} value="false" />
    </label>
  );
}

function parseColors(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}
