export default function ActiveStatus({ active }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}><span className={`size-1.5 rounded-full ${active ? 'bg-emerald-600' : 'bg-stone-400'}`} aria-hidden="true" />{active ? 'Activo' : 'Inactivo'}</span>
}
