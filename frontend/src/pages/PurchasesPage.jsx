import { Link } from 'react-router-dom'
import { Plus, ReceiptText } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import usePurchases from '../hooks/usePurchases.js'
import { canManagePurchases } from '../utils/purchaseRules.js'
import ProductFeedback from '../components/products/ProductFeedback.jsx'
import PurchaseCard from '../components/purchases/PurchaseCard.jsx'

export default function PurchasesPage() {
  const { user } = useAuth()
  const canManage = canManagePurchases(user)
  const { purchases, suppliers, users, loading, error, reload } = usePurchases(canManage)

  return <div className="space-y-5">
    <div className="rounded-2xl bg-[#48231f] px-5 py-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-7 sm:py-7">
      <div><div className="flex items-center gap-3"><ReceiptText size={24} aria-hidden="true" className="text-[#e5c9a6]" /><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Compras</h1></div><p className="mt-2 text-sm text-[#e9d7c5]">Ingresos de mercadería registrados.</p></div>
      {canManage && <Link to="/purchases/new" className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#7a2638] sm:mt-0"><Plus size={18} aria-hidden="true" />Nueva compra</Link>}
    </div>
    {!canManage ? <ProductFeedback kind="error" message="Solo ADMIN puede consultar y registrar compras." />
      : loading ? <ProductFeedback kind="loading" message="Cargando compras…" />
        : error ? <ProductFeedback kind="error" message={error} onRetry={reload} />
          : purchases.length ? <section aria-label="Compras registradas" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{purchases.map((purchase) => <PurchaseCard key={purchase.id} purchase={purchase} suppliers={suppliers} users={users} currentUser={user} />)}</section>
            : <ProductFeedback message="Todavía no hay compras registradas." />}
  </div>
}
