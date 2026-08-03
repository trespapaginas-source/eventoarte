import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  SORT_OPTIONS,
  type SortOption,
} from "~/lib/sample-data";

/**
 * Barra de filtros reutilizable para catálogo y categorías.
 *
 * Filtros que maneja (todos viven en la URL para poder compartir/favoritos):
 *  - Público: Niños / Niñas / Todos
 *  - Precio: rango mínimo y máximo (inputs)
 *  - Orden: relevancia, más vendidos, novedades, precio asc/desc
 *  - Categoría (opcional, sólo si se pasa el listado)
 *
 * El estado se sincroniza con los query params para que sea navegable.
 */

export interface FilterBarProps {
  priceMin: number;
  priceMax: number;
  showCategoryFilter?: boolean;
  categories?: { name: string; slug: string }[];
  activeCategory?: string;
  totalResults: number;
}

export function FilterBar({
  priceMin,
  priceMax,
  showCategoryFilter = false,
  categories = [],
  activeCategory,
  totalResults,
}: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Valores actuales desde la URL
  const currentAudience = searchParams.get("publico") ?? "";
  const currentSort = (searchParams.get("orden") as SortOption) ?? "relevancia";
  const currentMinPrice = searchParams.get("min");
  const currentMaxPrice = searchParams.get("max");
  const currentCategory = searchParams.get("categoria") ?? activeCategory ?? "";

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  const hasActiveFilters =
    currentAudience || currentMinPrice || currentMaxPrice || currentCategory;

  return (
    <div className="border-b border-border bg-surface">
      <div className="container-page py-4">
        {/* Fila superior: orden + toggle móvil */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-brand-ink-soft">
            <span className="font-medium text-brand-ink">{totalResults}</span>{" "}
            {totalResults === 1 ? "producto" : "productos"}
          </p>

          <div className="flex items-center gap-3">
            {/* Botón filtros (móvil) */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-1.5 border border-border px-3 py-2 text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft md:hidden"
              aria-expanded={mobileFiltersOpen}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filtros
            </button>

            {/* Orden (siempre visible) */}
            <label className="flex items-center gap-2">
              <span className="hidden text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-light sm:inline">
                Ordenar:
              </span>
              <select
                value={currentSort}
                onChange={(e) => updateFilter("orden", e.target.value)}
                className="border border-border bg-surface px-3 py-2 text-xs text-brand-ink focus:border-brand-ink focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Panel de filtros (siempre visible en desktop, toggle en móvil) */}
        <div className={`${mobileFiltersOpen ? "block" : "hidden"} mt-4 md:block`}>
          <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
            {/* Público */}
            <FilterGroup label="Público">
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={currentAudience === ""}
                  onClick={() => updateFilter("publico", "")}
                >
                  Todos
                </FilterChip>
                <FilterChip
                  active={currentAudience === "ninos"}
                  onClick={() => updateFilter("publico", "ninos")}
                >
                  🚀 Niños
                </FilterChip>
                <FilterChip
                  active={currentAudience === "ninas"}
                  onClick={() => updateFilter("publico", "ninas")}
                >
                  🎀 Niñas
                </FilterChip>
              </div>
            </FilterGroup>

            {/* Precio */}
            <FilterGroup label="Precio">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={String(priceMin)}
                  value={currentMinPrice ?? ""}
                  onChange={(e) => updateFilter("min", e.target.value)}
                  className="w-24 border border-border bg-surface px-2 py-1.5 text-xs text-brand-ink focus:border-brand-ink focus:outline-none"
                  aria-label="Precio mínimo"
                />
                <span className="text-xs text-brand-ink-light">—</span>
                <input
                  type="number"
                  placeholder={String(priceMax)}
                  value={currentMaxPrice ?? ""}
                  onChange={(e) => updateFilter("max", e.target.value)}
                  className="w-24 border border-border bg-surface px-2 py-1.5 text-xs text-brand-ink focus:border-brand-ink focus:outline-none"
                  aria-label="Precio máximo"
                />
              </div>
            </FilterGroup>

            {/* Categoría (opcional) */}
            {showCategoryFilter && categories.length > 0 ? (
              <FilterGroup label="Categoría">
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={currentCategory === ""}
                    onClick={() => updateFilter("categoria", "")}
                  >
                    Todas
                  </FilterChip>
                  {categories.map((cat) => (
                    <FilterChip
                      key={cat.slug}
                      active={currentCategory === cat.slug}
                      onClick={() => updateFilter("categoria", cat.slug)}
                    >
                      {cat.name}
                    </FilterChip>
                  ))}
                </div>
              </FilterGroup>
            ) : null}

            {/* Limpiar filtros */}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto self-center text-[11px] font-medium uppercase tracking-[1.5px] text-brand-coral hover:underline"
              >
                ✕ Limpiar filtros
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[1.5px] text-brand-ink-light">
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[1px] transition-colors ${
        active
          ? "border-brand-ink bg-brand-ink text-white"
          : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink"
      }`}
    >
      {children}
    </button>
  );
}
