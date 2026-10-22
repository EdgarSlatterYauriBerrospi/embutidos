import { useEffect, useState } from 'react'
import { getAllSales } from '../services/saleService.js'
import { getSaleError } from '../utils/saleError.js'

export default function useSales(enabled) {
  const [state, setState] = useState({ sales: [], loading: enabled, error: '' })
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (!enabled) return
    let current = true
    getAllSales().then((sales) => current && setState({ sales: [...sales].sort((a, b) => String(b.saleDate).localeCompare(String(a.saleDate))), loading: false, error: '' })).catch((cause) => current && setState({ sales: [], loading: false, error: getSaleError(cause) }))
    return () => { current = false }
  }, [enabled, revision])
  function reload() { setState((old) => ({ ...old, loading: true, error: '' })); setRevision((old) => old + 1) }
  return { ...state, reload }
}
