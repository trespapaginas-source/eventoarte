import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

/**
 * Editor de las 4 fotos del Hero del home.
 *
 * Cada slot sube una imagen a R2 (prefix "hero"). Las 4 claves se
 * serializan como un array JSON en un único input oculto `hero.images`
 * para que el action de ajustes las guarde en una sola fila de settings.
 *
 * En móvil el home usa solo la primera foto como fondo; en desktop se
 * muestran las 4 en grilla.
 */

const MAX = 4;

export interface HeroImageEditorProps {
  /** Valor inicial: JSON string con array de claves/rutas, o vacío. */
  initialJson?: string;
}

function parseInitial(json?: string): (string | null)[] {
  const empty: (string | null)[] = [null, null, null, null];
  if (!json) return empty;
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return empty;
    const filled = [...arr.map(String), null, null, null, null].slice(0, MAX);
    return filled;
  } catch {
    return empty;
  }
}

export function HeroImageEditor({ initialJson }: HeroImageEditorProps) {
  const [images, setImages] = useState<(string | null)[]>(parseInitial(initialJson));
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setImages(parseInitial(initialJson));
  }, [initialJson]);

  async function handleUpload(slot: number, files: FileList | null) {
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
      setImages((prev) => {
        const next = [...prev];
        next[slot] = data.key!;
        return next;
      });
    } catch {
      /* ignore */
    }
  }

  function removeImage(slot: number) {
    setImages((prev) => {
      const next = [...prev];
      next[slot] = null;
      return next;
    });
  }

  // Serializa las claves no nulas como JSON para el hidden input
  const filledKeys = images.filter((k): k is string => Boolean(k));
  const jsonValue = JSON.stringify(filledKeys);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((key, i) => {
          const url = key ? (key.startsWith("/") || key.startsWith("http") ? key : `/media/${key}`) : null;
          return (
            <div key={i}>
              <input
                ref={(el) => {
                  fileRefs.current[i] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleUpload(i, e.target.files)}
              />
              <div className="relative aspect-square overflow-hidden border border-border bg-surface-off">
                {url ? (
                  <>
                    <img src={url} alt={`Hero ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Quitar imagen"
                      className="absolute right-1 top-1 bg-brand-ink/80 p-1 text-white"
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                    {i === 0 ? (
                      <span className="absolute bottom-0 left-0 right-0 bg-brand-ink/80 px-1 py-0.5 text-center text-[8px] uppercase tracking-wider text-white">
                        Principal (fondo móvil)
                      </span>
                    ) : null}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRefs.current[i]?.click()}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 text-brand-ink-light transition-colors hover:border-brand-ink hover:text-brand-ink"
                  >
                    <Upload size={18} strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-wide">Foto {i + 1}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <input type="hidden" name="hero.images" value={jsonValue} />
      <p className="mt-2 text-[11px] text-brand-ink-light">
        Hasta {MAX} fotos · La primera es el fondo en móvil y la principal del collage en desktop · JPG, PNG o WEBP · Máx 5 MB
      </p>
    </div>
  );
}
