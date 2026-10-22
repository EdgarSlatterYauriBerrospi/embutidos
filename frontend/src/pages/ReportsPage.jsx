import { BarChart3, CalendarDays, Download, FileText, LoaderCircle } from 'lucide-react'
import useReports from '../hooks/useReports.js'
import { formatCount, formatMoney } from '../utils/dashboardFormatters.js'
import { REPORT_TYPES, reportDefinition } from '../utils/reportDefinitions.js'

function formatSummaryValue(item) {
  return item.format === 'money'
    ? formatMoney(item.value)
    : formatCount(item.value)
}

export default function ReportsPage() {
  const reports = useReports()
  const selectedReport = reportDefinition(reports.reportType)
  const cannotExport = reports.loading || Boolean(reports.previewError) || Boolean(reports.filterError) || reports.exporting

  function submit(event) {
    event.preventDefault()
    reports.exportPdf()
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl bg-[#48231f] px-5 py-5 text-white sm:px-7 sm:py-7">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} aria-hidden="true" className="text-[#e5c9a6]" />
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Reportes</h1>
        </div>
        <p className="mt-2 text-sm text-[#e9d7c5]">Consulta un resumen y exporta información del negocio en PDF.</p>
      </header>

      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
        <section aria-labelledby="report-type-title" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <FileText size={18} aria-hidden="true" className="text-[#7a2638]" />
            <h2 id="report-type-title" className="text-sm font-semibold text-stone-900">Tipo de reporte</h2>
          </div>
          <label htmlFor="report-type" className="mt-3 block text-xs font-medium text-stone-500">Selecciona la información que deseas exportar</label>
          <select
            id="report-type"
            value={reports.reportType}
            onChange={(event) => reports.changeReportType(event.target.value)}
            disabled={reports.exporting}
            className="mt-1.5 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10 disabled:opacity-60"
          >
            {REPORT_TYPES.map((report) => <option key={report.id} value={report.id}>{report.label}</option>)}
          </select>
        </section>

        {selectedReport?.usesDateRange && <section aria-labelledby="report-dates-title" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} aria-hidden="true" className="text-[#7a2638]" />
            <h2 id="report-dates-title" className="text-sm font-semibold text-stone-900">Rango de fechas</h2>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-stone-600">Desde
              <input type="date" required value={reports.filters.fromDate} max={reports.filters.toDate || undefined} onChange={(event) => reports.changeDate('fromDate', event.target.value)} disabled={reports.exporting} className="mt-1.5 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10 disabled:opacity-60" />
            </label>
            <label className="text-xs font-medium text-stone-600">Hasta
              <input type="date" required value={reports.filters.toDate} min={reports.filters.fromDate || undefined} onChange={(event) => reports.changeDate('toDate', event.target.value)} disabled={reports.exporting} className="mt-1.5 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 focus:border-[#7a2638] focus:outline-none focus:ring-2 focus:ring-[#7a2638]/10 disabled:opacity-60" />
            </label>
          </div>
          {reports.filterError && <p role="alert" className="mt-2 text-xs text-red-800">{reports.filterError}</p>}
        </section>}

        <section aria-labelledby="report-summary-title" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <h2 id="report-summary-title" className="text-sm font-semibold text-stone-900">Resumen</h2>
          {reports.loading ? <div role="status" className="mt-3 flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-4 text-sm text-stone-500"><LoaderCircle size={17} className="animate-spin" aria-hidden="true" />Cargando resumen…</div>
            : reports.previewError ? <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-4 text-sm text-amber-800">{reports.previewError}</p>
              : <dl className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">{reports.summary.map((item) => <div key={item.label} className="min-w-0 rounded-xl bg-[#f7f5f0] p-3 sm:p-4"><dt className="text-[11px] leading-4 text-stone-500 sm:text-xs">{item.label}</dt><dd className="mt-1 truncate text-lg font-semibold tabular-nums text-[#48231f] sm:text-xl">{formatSummaryValue(item)}</dd></div>)}</dl>}
        </section>

        {reports.exportError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{reports.exportError}</p>}
        {reports.success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{reports.success}</p>}

        <button type="submit" disabled={cannotExport} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7a2638] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#64202f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a2638]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 sm:ml-auto sm:w-auto sm:min-w-44">
          {reports.exporting ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
          {reports.exporting ? 'Generando PDF…' : 'Exportar PDF'}
        </button>
      </form>
    </div>
  )
}
