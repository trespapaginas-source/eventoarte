import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

/**
 * Subidor de UNA imagen para el CMS (categorías, banners, etc.).
 *
 * Sube el archivo a R2 vía POST /admin/upload y guarda la clave R2
 * en un input oculto con el `name` indicado, para que el action del
 * formulario la reciba como cualquier otro campo.
 *
 * Si ya hay una imagen (initialKey), la muestra como preview y permite
 * quitarla o reemplazarla.
 */

export interface SingleImageUploaderProps {
  /** Name del campo en el formulario (ej: "imageKey"). */
  name: string;
  /** Clave R2 inicial al editar (opcional). */
  initialKey?: string | null;
  /** Prefijo de organización en R2 (ej: "categorias"). Default "general". */
  prefix?: string;
  /** Texto de ayuda bajo el botón. */
  hint?: string;
}

export function SingleImageUploader({
  name,
  initialKey,
  prefix = "general",
  hint,
}: SingleImageUploaderProps) {
  const [imageKey, setImageKey] = useState<string | null>(initialKey ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Si cambia initialKey (al editar otra categoría), sincronizar
  useEffect(() => {
    setImageKey(initialKey ?? null);
  }, [initialKey]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const fd = new FormData();
    // Importante: el prefijo debe ir ANTES del archivo para que el
    // parser multipart de Workers lo lea correctamente.
    fd.append("prefix", prefix);
    fd.append("file", file);
    try {
      const res = await fetch("/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string; key?: string; url?: string };
      if (!res.ok || !data.key) {
        setError(data.error ?? "Error al subir la imagen");
        setUploading(false);
        return;
      }
      setImageKey(data.key);
    } catch {
      setError("Error de red al subir la imagen");
    }
    setUploading(false);
  }

  function removeImage() {
    setImageKey(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const previewUrl = imageKey ? `/media/${imageKey}` : null;

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
        onChange={(e) => handleUpload(e.target.files)} />

      {previewUrl ? (
        <div className="relative inline-block">
          <img src={previewUrl} alt="Vista previa" className="h-32 w-32 border border-border object-cover" />
          <button type="button" onClick={removeImage} aria-label="Quitar imagen"
            className="absolute right-1 top-1 bg-brand-ink/80 p-1 text-white">
            <X size={12} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex h-32 w-32 flex-col items-center justify-center gap-1 border border-dashed border-border text-brand-ink-light transition-colors hover:border-brand-ink hover:text-brand-ink disabled:opacity-50">
          {uploading ? (
            <span className="text-[10px]">Subiendo…</span>
          ) : (
            <>
              <Upload size={18} strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-wide">Subir</span>
            </>
          )}
        </button>
      )}

      {/* Input oculto con la clave R2 para que el action la reciba */}
      <input type="hidden" name={name} value={imageKey ?? ""} />

      {error ? <p className="mt-2 text-xs text-error">{error}</p> : null}
      <p className="mt-2 text-[11px] text-brand-ink-light">
        {hint ?? "JPG, PNG o WEBP · Máx 5 MB"}
      </p>
    </div>
  );
}
