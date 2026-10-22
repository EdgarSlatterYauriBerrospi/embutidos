import { useEffect, useMemo, useState } from 'react'
import { exportReportPdf, getReportPreviewRecords } from '../services/reportService.js'
import { defaultReportDates, validateReportFilters } from '../utils/reportDefinitions.js'
import { getReportError } from '../utils/reportError.js'
import { buildReportSummary } from '../utils/reportSummary.js'

export default function useReports() {
  const [reportType, setReportType] = useState('sales')
  const [filters, setFilters] = useState(defaultReportDates)
  const [preview, setPreview] = useState({ reportType: 'sales', records: [], loading: true, error: '' })
  const [exportState, setExportState] = useState({ exporting: false, error: '', success: '' })

  useEffect(() => {
    let current = true
    getReportPreviewRecords(reportType)
      .then((records) => {
        if (current) setPreview({ reportType, records, loading: false, error: '' })
      })
      .catch((error) => {
        if (current) setPreview({ reportType, records: [], loading: false, error: getReportError(error) })
      })
    return () => { current = false }
  }, [reportType])

  const filterError = validateReportFilters(reportType, filters)
  const summary = useMemo(
    () => buildReportSummary(
      reportType,
      preview.reportType === reportType ? preview.records : [],
      filters,
    ),
    [reportType, preview.reportType, preview.records, filters],
  )

  function changeReportType(nextType) {
    setReportType(nextType)
    setExportState({ exporting: false, error: '', success: '' })
  }

  function changeDate(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
    setExportState((current) => ({ ...current, error: '', success: '' }))
  }

  async function exportPdf() {
    if (exportState.exporting || filterError) return
    setExportState({ exporting: true, error: '', success: '' })
    try {
      await exportReportPdf(reportType, filters)
      setExportState({ exporting: false, error: '', success: 'El PDF se descargó correctamente.' })
    } catch (error) {
      setExportState({ exporting: false, error: getReportError(error, 'export'), success: '' })
    }
  }

  return {
    reportType,
    changeReportType,
    filters,
    changeDate,
    filterError,
    summary,
    loading: preview.loading || preview.reportType !== reportType,
    previewError: preview.reportType === reportType ? preview.error : '',
    exporting: exportState.exporting,
    exportError: exportState.error,
    success: exportState.success,
    exportPdf,
  }
}
