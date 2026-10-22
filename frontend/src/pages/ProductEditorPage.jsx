import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useProductEditor from '../hooks/useProductEditor.js'
import ProductForm from '../components/products/ProductForm.jsx'
import ProductFeedback from '../components/products/ProductFeedback.jsx'

function ProductEditor({ id }) {
  const editor = useProductEditor(id)
  if (!id && !editor.canEdit) return <ProductFeedback kind="error" message="Solo ADMIN puede crear productos." />

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/products" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-stone-500 hover:text-red-900"><ArrowLeft size={18} aria-hidden="true" />Productos</Link>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{id ? editor.canEdit ? 'Editar producto' : 'Detalle del producto' : 'Nuevo producto'}</h1>
      {editor.loading ? <ProductFeedback kind="loading" message="Cargando producto…" /> : editor.error && !editor.values.name ? <ProductFeedback kind="error" message={editor.error} onRetry={editor.reload} /> : <ProductForm editor={editor} isEditing={Boolean(id)} />}
    </div>
  )
}

export default function ProductEditorPage() {
  const { id } = useParams()
  return <ProductEditor key={id ?? 'new'} id={id} />
}
