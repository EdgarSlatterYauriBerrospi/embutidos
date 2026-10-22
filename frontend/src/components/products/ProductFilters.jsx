import { Search } from 'lucide-react'

export default function ProductFilters({ query, onQueryChange, categories = [], categoryId = '', onCategoryChange }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="product-search" className="sr-only">Buscar productos</label>
        <Search size={19} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" />
        <input id="product-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar por nombre o descripción" className="min-h-12 w-full rounded-xl border border-stone-200 bg-white py-3 pr-4 pl-11 text-base focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/10" />
      </div>
      <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onCategoryChange?.('')} aria-pressed={categoryId === ''} className="min-h-11 rounded-full bg-[#7a2638] px-5 py-2 text-sm font-medium text-white">Todos</button>
        {categories.map((category) => <button key={category.id} type="button" onClick={() => onCategoryChange?.(category.id)} aria-pressed={categoryId === category.id} className="min-h-11 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 aria-pressed:border-red-900 aria-pressed:text-red-900">{category.name}</button>)}
        {!categories.length && <button type="button" disabled title="El backend todavía no admite categorías" className="min-h-11 cursor-not-allowed rounded-full border border-dashed border-stone-300 px-4 py-2 text-xs text-stone-500">Categorías · Próximamente</button>}
      </div>
    </div>
  )
}
