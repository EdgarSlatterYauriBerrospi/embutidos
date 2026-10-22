function Block({ className = '' }) {
  return <span className={`block animate-pulse rounded-lg bg-stone-200/80 ${className}`} />
}

export default function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando dashboard">
      <div className="space-y-3 md:hidden">
        <div className="flex h-11 items-center justify-between"><div><Block className="h-5 w-36" /><Block className="mt-2 h-2.5 w-20" /></div><Block className="size-10 rounded-xl" /></div>
        <div className="grid grid-cols-2 gap-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[78px] rounded-xl border border-stone-200 bg-white p-3"><Block className="h-2.5 w-20" /><Block className="mt-4 h-5 w-24" /></div>)}</div>
        <div className="h-[178px] rounded-xl border border-stone-200 bg-white p-3"><Block className="h-3 w-36" /><Block className="mt-4 h-[130px] w-full" /></div>
        <div className="h-[139px] rounded-xl border border-stone-200 bg-white p-3"><Block className="h-3 w-28" />{Array.from({ length: 3 }, (_, index) => <Block key={index} className="mt-3 h-7 w-full" />)}</div>
      </div>
      <div className="hidden space-y-6 md:block">
        <div><Block className="h-8 w-48" /><Block className="mt-3 h-4 w-64" /></div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Block key={index} className="h-32" />)}</div>
        <div className="grid gap-6 xl:grid-cols-3"><Block className="h-80 xl:col-span-2" /><Block className="h-80" /></div>
      </div>
    </div>
  )
}
