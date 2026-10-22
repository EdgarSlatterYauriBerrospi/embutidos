export default function StatCard({ label, value, detail, error, icon: Icon, tone = 'neutral', compact = false }) {
  const iconTone = tone === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-red-900/5 text-red-900'
  return (
    <section aria-label={label} title={error || undefined} className={`min-w-0 border border-stone-200 bg-white ${compact ? 'rounded-xl px-3 py-2.5' : 'rounded-2xl p-4 sm:p-5'}`}>
      <div className="flex items-start justify-between gap-2">
        <h2 className={`font-medium text-stone-500 ${compact ? 'text-[11px] leading-5' : 'text-xs leading-5 sm:text-sm'}`}>{label}</h2>
        <span className={`flex shrink-0 items-center justify-center rounded-lg ${compact ? 'size-6' : 'size-8'} ${iconTone}`}><Icon size={compact ? 15 : 17} strokeWidth={1.7} aria-hidden="true" /></span>
      </div>
      <p className={`break-words font-semibold tracking-tight tabular-nums text-stone-900 ${compact ? 'mt-1 text-lg leading-6' : 'mt-3 text-xl sm:text-2xl'}`}>{value}</p>
      {!compact && <p className={`mt-1.5 text-xs leading-5 ${error ? 'text-amber-700' : 'text-stone-500'}`}>{error || detail}</p>}
      {compact && error && <span className="sr-only">{error}</span>}
    </section>
  )
}
