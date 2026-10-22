import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LoaderCircle, Plus, Search } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import usePurchaseForm from '../hooks/usePurchaseForm.js'
import usePurchaseOptions from '../hooks/usePurchaseOptions.js'
import { availablePurchaseProducts, availableSuppliers, canManagePurchases, purchaseTotal } from '../utils/purchaseRules.js'
import { formatProductPrice } from '../utils/productFormatters.js'
import ProductFeedback from '../components/products/ProductFeedback.jsx'
import ProductImage from '../components/products/ProductImage.jsx'
import PurchaseLineEditor from '../components/purchases/PurchaseLineEditor.jsx'
import PurchaseSuccess from '../components/purchases/PurchaseSuccess.jsx'
import useNotifications from '../hooks/useNotifications.js'

function PurchaseEntry({ userId }) {
  const { refresh: refreshNotifications } = useNotifications()
  const options = usePurchaseOptions(true)
  const form = usePurchaseForm(userId, refreshNotifications)
  const [query, setQuery] = useState('')
  const products = availablePurchaseProducts(options.products, query)
  const suppliers = availableSuppliers(options.suppliers)
  const productById = new Map(options.products.map((product) => [String(product.id), product]))

  if (form.completed) return <PurchaseSuccess purchase={form.completed} />

  return <div className="mx-auto max-w-5xl space-y-5 pb-24 lg:pb-0">
    <div className="flex items-center gap-3"><Link to="/purchases" aria-label="Volver a compras" className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white"><ArrowLeft size={19} aria-hidden="true" /></Link><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Nueva compra</h1><p className="text-sm text-stone-500">Registrar ingreso de mercadería</p></div></div>
    {options.loading ? <ProductFeedback kind="loading" message="Cargando proveedores y productos…" /> : options.error ? <ProductFeedback kind="error" message={options.error} onRetry={options.reload} /> : <form onSubmit={form.submit} className="space-y-5">
      <section aria-labelledby="purchase-header-title" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6"><h2 id="purchase-header-title" className="text-base font-semibold">Datos de la compra</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><label htmlFor="purchase-supplier" className="mb-1 block text-sm font-medium">Proveedor</label><select id="purchase-supplier" required value={form.supplierId} onChange={(event) => form.setSupplierId(event.target.value)} disabled={form.busy} className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10"><option value="">Selecciona un proveedor</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>{!suppliers.length && <p className="mt-1 text-xs text-amber-800">No hay proveedores activos disponibles.</p>}</div><div><label htmlFor="purchase-invoice" className="mb-1 block text-sm font-medium">Número de comprobante <span className="font-normal text-stone-400">(opcional)</span></label><input id="purchase-invoice" value={form.invoiceNumber} onChange={(event) => form.setInvoiceNumber(event.target.value)} disabled={form.busy} maxLength={100} className="min-h-12 w-full rounded-xl border border-stone-300 px-4 text-base focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10" /></div></div></section>

      <section aria-labelledby="purchase-products-title" className="space-y-3"><div className="flex items-end justify-between gap-3"><div><h2 id="purchase-products-title" className="text-base font-semibold">Agregar productos</h2><p className="text-xs text-stone-500">Puedes agregar el mismo producto otra vez si tiene otro vencimiento.</p></div></div><label className="relative block"><span className="sr-only">Buscar productos</span><Search size={19} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos" className="min-h-12 w-full rounded-xl border border-stone-200 bg-white pr-4 pl-11 text-base focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10" /></label>{products.length ? <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 md:grid-cols-2">{products.map((product) => <div key={product.id} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3"><ProductImage imageUrl={product.imageUrl} name={product.name} className="size-12" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span><button type="button" onClick={() => form.addProduct(product)} disabled={form.busy} aria-label={`Agregar ${product.name}`} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#7a2638] text-white disabled:opacity-50"><Plus size={19} aria-hidden="true" /></button></div>)}</div> : <ProductFeedback message={options.products.length ? 'No encontramos productos activos con esa búsqueda.' : 'No hay productos disponibles para el ingreso.'} />}</section>

      <section aria-labelledby="purchase-lines-title" className="space-y-3"><h2 id="purchase-lines-title" className="text-base font-semibold">Productos seleccionados <span className="font-normal text-stone-500">({form.lines.length})</span></h2>{form.lines.length ? <div className="grid gap-3 xl:grid-cols-2">{form.lines.map((line, index) => <PurchaseLineEditor key={line.key} line={line} index={index} product={productById.get(String(line.productId))} busy={form.busy} onUpdate={(field, value) => form.updateLine(line.key, field, value)} onQuantityChange={(difference) => form.changeQuantity(line.key, difference)} onRemove={() => form.removeLine(line.key)} />)}</div> : <ProductFeedback message="Agrega productos para registrar el ingreso." />}</section>

      {form.error && <ProductFeedback kind="error" message={form.error} />}
      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 border-t border-stone-200 bg-white p-3 lg:static lg:rounded-2xl lg:border"><div className="mx-auto flex max-w-5xl items-center gap-4"><div className="min-w-0 flex-1"><p className="text-xs text-stone-500">Total estimado</p><p className="truncate text-lg font-semibold tabular-nums">{formatProductPrice(purchaseTotal(form.lines))}</p></div><button type="submit" disabled={form.busy || !form.lines.length || !suppliers.length} className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7a2638] px-5 text-sm font-semibold text-white disabled:bg-stone-200 disabled:text-stone-500">{form.busy && <LoaderCircle size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}{form.busy ? 'Registrando…' : 'Registrar ingreso'}</button></div></div>
    </form>}
  </div>
}

export default function NewPurchasePage() {
  const { user } = useAuth()
  if (!canManagePurchases(user)) return <ProductFeedback kind="error" message="Solo ADMIN puede registrar compras." />
  return <PurchaseEntry userId={user.userId} />
}
