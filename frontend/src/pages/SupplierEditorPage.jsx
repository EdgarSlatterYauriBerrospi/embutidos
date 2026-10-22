import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import useSupplierEditor from '../hooks/useSupplierEditor.js'
import { canManageSuppliers } from '../utils/supplierRules.js'
import ProductFeedback from '../components/products/ProductFeedback.jsx'
import SupplierForm from '../components/suppliers/SupplierForm.jsx'

function SupplierEditor({ id }) {
  const editor = useSupplierEditor(id)
  return <div className="mx-auto max-w-2xl space-y-5">
    <Link to="/suppliers" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#7a2638]"><ArrowLeft size={18} aria-hidden="true" />Proveedores</Link>
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{id ? 'Editar proveedor' : 'Nuevo proveedor'}</h1>
    {editor.loading ? <ProductFeedback kind="loading" message="Cargando proveedor…" /> : editor.error && !editor.values.name ? <ProductFeedback kind="error" message={editor.error} onRetry={editor.reload} /> : <SupplierForm editor={editor} isEditing={Boolean(id)} />}
  </div>
}

export default function SupplierEditorPage() {
  const { id } = useParams()
  const { user } = useAuth()
  if (!canManageSuppliers(user)) return <ProductFeedback kind="error" message="Solo ADMIN puede gestionar proveedores." />
  return <SupplierEditor key={id ?? 'new'} id={id} />
}
