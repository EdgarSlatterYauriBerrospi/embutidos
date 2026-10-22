import { EXPIRATION_FILTERS } from '../../utils/expirationRules.js'

export default function ExpirationFilters({ value, onChange }) {
  return <div role="group" aria-label="Filtrar lotes por vencimiento" className="flex gap-2 overflow-x-auto pb-1">
    {EXPIRATION_FILTERS.map((filter) => <button key={filter.id} type="button" aria-pressed={value === filter.id} onClick={() => onChange(filter.id)} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${value === filter.id ? 'border-[#7a2638] bg-[#7a2638] text-white' : 'border-stone-200 bg-white text-stone-700 hover:border-[#7a2638]/40'}`}>{filter.label}</button>)}
  </div>
}
