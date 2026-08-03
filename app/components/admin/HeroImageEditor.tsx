import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

/**
 * Subidor de la ÚNICA foto del Hero del home.
 *
 * Sube la imagen a R2 (prefix "hero") y la guarda como un array JSON
 * de un elemento en el input oculto `hero.images`, para mantener
 * compatibilidad con resolveHeroImages() que espera un array.
 *
 * - Desktop: la foto se muestra horizontal, cubriendo todo el hero.
 * - Móvil: se recorta a ~3/4 (vertical) automáticamente con bg-cover.
 */

export interface HeroImageEditorProps {
  /** Valor inicial: JSON string con array de claves/rutas, o vacío. */
  initialJson?: string;
}

function parseInitial(json?: string): string | null {
  if (!json) return null;
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr) && arr.length > 0) return String(arr[0]);
    return null;
  } catch {
    return null;
  }
}

export function HeroImageEditor({ initialJson }: HeroImageEditorProps) {
  const [imageKey, setImageKey] = useState<string | null>(parseInitial(initialJson));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageKey(parseInitial(initialJson));
  }, [initialJson]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("prefix", "hero");
    fd.append("file", file);
    try {
      const res = await fetch("/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string; key?: string };
      if (!res.ok || !data.key) return;
      setImageKey(data.key);
    } catch {
      /* ignore */
    }
  }

  function removeImage() {
    setImageKey(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const url = imageKey
    ? imageKey.startsWith("/") || imageKey.startsWith("http")
      ? imageKey
      : `/media/${imageKey}`
    : null;

  // Serializa como array de un elemento para compatibilidad con resolveHeroImages
  const jsonValue = imageKey ? JSON.stringify([imageKey]) : "[]";

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      {url ? (
        <div className="relative inline-block">
          <img src={url} alt="Foto del hero" className="h-32 w-48 border border-border object-cover" />
          <button
            type="button"
            onClick={removeImage}
            aria-label="Quitar imagen"
            className="absolute right-1 top-1 bg-brand-ink/80 p-1 text-white"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-32 w-48 flex-col items-center justify-center gap-1 border border-dashed border-border text-brand-ink-light transition-colors hover:border-brand-ink hover:text-brand-ink"
        >
          <Upload size={18} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-wide">Subir foto</span>
        </button>
      )}
      <input type="hidden" name="hero.images" value={jsonValue} />
      <p className="mt-2 text-[11px] text-brand-ink-light">
        Se muestra de fondo en el hero del home. Recomendado: foto horizontal de buena calidad. En móvil se recorta a formato vertical automáticamente. JPG, PNG o WEBP · Máx 5 MB.
      </p>
    </div>
  );
}
