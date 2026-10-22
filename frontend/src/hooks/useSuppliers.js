import { useEffect, useMemo, useState } from 'react'
import { getAllSuppliers } from '../services/supplierService.js'
import { getSupplierError } from '../utils/supplierError.js'
import { filterSuppliers } from '../utils/supplierRules.js'

export default function useSuppliers(enabled) {
  const [state, setState] = useState({ allSuppliers: [], loading: enabled, error: '' })
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let current = true
    getAllSuppliers().then((allSuppliers) => {
      if (current) setState({ allSuppliers, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ allSuppliers: [], loading: false, error: getSupplierError(cause) })
    })
    return () => { current = false }
  }, [enabled, revision])

  const suppliers = useMemo(() => filterSuppliers(state.allSuppliers, query, status), [state.allSuppliers, query, status])
  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }
  return { ...state, suppliers, query, setQuery, status, setStatus, reload }
}
