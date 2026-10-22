import EmptyList from './EmptyList.jsx'

export default function LowStockList({ items = [] }) {
  if (!items.length) return <EmptyList />
  return (
    <ul className="divide-y divide-stone-100 px-4 sm:px-5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-4">
          <div className="min-w-0"><p className="text-sm font-medium text-stone-800">{item.name}</p><p className="mt-1 text-xs leading-5 text-stone-500">Stock mínimo: {item.minimum}</p></div>
          <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">{item.stock}</span>
        </li>
      ))}
    </ul>
  )
}
