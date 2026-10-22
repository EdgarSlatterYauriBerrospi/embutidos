import ProductSaleItem from './ProductSaleItem.jsx'
import { calculateCartTotal } from '../../utils/saleRules.js'
import { formatSaleMoney } from '../../utils/saleFormatters.js'

export default function SaleSummary({ lines, editable = false, onQuantityChange, onRemove }) {
  return <section aria-labelledby="sale-summary-title" className="space-y-3"><div className="flex items-center justify-between"><h2 id="sale-summary-title" className="text-sm font-semibold">Productos seleccionados</h2><span className="text-xs text-stone-500">{lines.length} {lines.length === 1 ? 'producto' : 'productos'}</span></div>
    <div className="space-y-2">{lines.map((line) => editable ? <ProductSaleItem key={line.product.id} selected product={line.product} quantity={line.quantity} onQuantityChange={(quantity) => onQuantityChange(line.product.id, quantity)} onRemove={() => onRemove(line.product.id)} /> : <div key={line.product.id} className="flex items-center justify-between gap-3 border-b border-stone-100 py-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{line.product.name}</p><p className="mt-1 text-xs text-stone-500">{line.quantity} × {formatSaleMoney(line.product.price)}</p></div><p className="shrink-0 font-semibold tabular-nums">{formatSaleMoney(Number(line.product.price) * line.quantity)}</p></div>)}</div>
    <div className="flex items-center justify-between rounded-xl bg-[#48231f] px-4 py-3 text-white"><span className="text-sm">Total</span><strong className="text-xl tabular-nums">{formatSaleMoney(calculateCartTotal(lines))}</strong></div>
  </section>
}
