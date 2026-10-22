import { useEffect, useState } from 'react'
import { getBatchesByProduct } from '../services/productBatchService.js'
import { getMovementsByProduct } from '../services/stockMovementService.js'
import { getAllUsers } from '../services/userService.js'
import { getStockError } from '../utils/stockError.js'

export default function useStockRecords(productId, tab, isAdmin) {
  const [state, setState] = useState({ items: [], users: [], loading: true, error: '' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let current = true
    async function load() {
      try {
        const items = tab === 'batches'
          ? await getBatchesByProduct(productId)
          : await getMovementsByProduct(productId)
        // Names are optional enrichment. EMPLOYEE cannot access /api/users.
        const users = tab === 'movements' && isAdmin && items.length
          ? await getAllUsers().catch(() => [])
          : []
        if (current) setState({ items, users, loading: false, error: '' })
      } catch (cause) {
        if (current) setState({ items: [], users: [], loading: false, error: getStockError(cause, tab === 'batches' ? 'los lotes' : 'los movimientos') })
      }
    }
    load()
    return () => { current = false }
  }, [productId, tab, isAdmin, revision])

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }

  return { ...state, reload }
}
