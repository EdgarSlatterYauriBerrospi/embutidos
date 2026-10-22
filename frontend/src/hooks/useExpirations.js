import { useEffect, useMemo, useState } from 'react'
import { getAllBatches, getExpiringBatches } from '../services/productBatchService.js'
import { getAllProducts } from '../services/productService.js'
import { getStockError } from '../utils/stockError.js'
import { EXPIRATION_FILTERS, filterExpirationBatches, localDateIso, localDatePlusDays } from '../utils/expirationRules.js'

export default function useExpirations(filterId) {
  const [state, setState] = useState({ filterId, batches: [], products: [], loading: true, error: '' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let current = true
    const today = new Date()
    const rangeDays = EXPIRATION_FILTERS.find((filter) => filter.id === filterId)?.days
    const batchRequest = rangeDays === undefined
      ? getAllBatches()
      : getExpiringBatches(localDateIso(today), localDatePlusDays(rangeDays, today))

    async function load() {
      const [batches, products] = await Promise.allSettled([batchRequest, getAllProducts()])
      if (!current) return
      if (batches.status === 'rejected') {
        setState({ filterId, batches: [], products: [], loading: false, error: getStockError(batches.reason, 'los vencimientos') })
      } else {
        setState({ filterId, batches: batches.value, products: products.status === 'fulfilled' ? products.value : [], loading: false, error: '' })
      }
    }
    load()
    return () => { current = false }
  }, [filterId, revision])

  const batches = useMemo(() => filterExpirationBatches(state.batches, filterId), [state.batches, filterId])
  const productById = useMemo(() => new Map(state.products.map((product) => [String(product.id), product])), [state.products])
  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }
  return { batches, productById, loading: state.loading || state.filterId !== filterId, error: state.filterId === filterId ? state.error : '', reload }
}
