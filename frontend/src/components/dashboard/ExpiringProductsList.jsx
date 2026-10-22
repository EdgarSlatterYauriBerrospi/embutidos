import EmptyList from './EmptyList.jsx'

export default function ExpiringProductsList({ items = [] }) {
  if (!items.length) return <EmptyList />
  return (
    <ul className="divide-y divide-stone-100 px-4 sm:px-5">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 py-4">
          <div className="min-w-0"><p className="text-sm font-medium text-stone-800">{item.name}</p><p className="mt-1 text-xs leading-5 text-stone-500">Lote {item.batch} · {item.quantity}</p></div>
          <div className="shrink-0 text-right"><p className="text-xs text-stone-500">Vence</p><p className="mt-1 text-xs font-medium text-red-900">{item.expiryLabel}</p></div>
        </li>
      ))}
    </ul>
  )
}
