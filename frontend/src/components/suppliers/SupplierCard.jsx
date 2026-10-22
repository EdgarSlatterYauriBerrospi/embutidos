import { ChevronRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SupplierCard({ supplier }) {
  return <Link to={`/suppliers/${supplier.id}/edit`} className="block min-w-0 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-[#7a2638]/40 hover:bg-[#fffdf9] sm:p-5">
    <div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words text-base font-semibold text-stone-900">{supplier.name}</h2><ChevronRight size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-stone-400" /></div>
    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${supplier.active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>{supplier.active ? 'Activo' : 'Inactivo'}</span>
    <dl className="mt-3 space-y-2 border-t border-stone-100 pt-3 text-sm text-stone-600">
      <div className="flex min-w-0 gap-2"><dt className="sr-only">Teléfono</dt><Phone size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#7a2638]" /><dd className="min-w-0 break-words">{supplier.phone || 'Sin teléfono'}</dd></div>
      <div className="flex min-w-0 gap-2"><dt className="sr-only">Correo</dt><Mail size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#7a2638]" /><dd className="min-w-0 break-all">{supplier.email || 'Sin correo'}</dd></div>
      <div className="flex min-w-0 gap-2"><dt className="sr-only">Dirección</dt><MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#7a2638]" /><dd className="min-w-0 break-words">{supplier.address || 'Sin dirección'}</dd></div>
    </dl>
  </Link>
}
