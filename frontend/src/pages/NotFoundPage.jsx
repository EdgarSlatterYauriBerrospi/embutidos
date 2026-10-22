import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-10">
      <p className="text-sm font-semibold text-red-800">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Página no encontrada</h1>
      <p className="mt-4 text-stone-600">La dirección que buscas no existe.</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-red-800 px-5 py-3 font-medium text-white hover:bg-red-900">
        Volver al inicio
      </Link>
    </section>
  )
}
