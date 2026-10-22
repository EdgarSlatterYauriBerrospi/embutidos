import { AlertCircle, CheckCircle2, LoaderCircle, PackageSearch } from 'lucide-react'

export default function ProductFeedback({ kind = 'empty', message, onRetry }) {
  const Icon = { loading: LoaderCircle, error: AlertCircle, success: CheckCircle2, empty: PackageSearch }[kind]
  const style = kind === 'error' ? 'border-red-200 bg-red-50 text-red-900' : kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-white text-stone-500'
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 text-sm ${style}`}>
      <Icon size={20} aria-hidden="true" className={`shrink-0 ${kind === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''}`} />
      <p className="min-w-0 flex-1">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="min-h-11 rounded-lg px-3 font-semibold underline underline-offset-4">Reintentar</button>}
    </div>
  )
}
