import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useUserEditor from '../hooks/useUserEditor.js'
import UserForm from '../components/users/UserForm.jsx'
import ProductFeedback from '../components/products/ProductFeedback.jsx'

function UserEditor({ id }) {
  const editor = useUserEditor(id)
  return <div className="mx-auto max-w-2xl space-y-5">
    <Link to="/users" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#7a2638]"><ArrowLeft size={18} aria-hidden="true" />Usuarios</Link>
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{id ? 'Editar usuario' : 'Nuevo usuario'}</h1>
    {editor.loading ? <ProductFeedback kind="loading" message="Cargando usuario…" /> : editor.error && !editor.values.name ? <ProductFeedback kind="error" message={editor.error} onRetry={editor.reload} /> : <UserForm editor={editor} isEditing={Boolean(id)} />}
  </div>
}

export default function UserEditorPage() {
  const { id } = useParams()
  return <UserEditor key={id ?? 'new'} id={id} />
}
