import { useEffect, useState } from 'react'
import { getAllProducts } from '../services/productService.js'
import { getAllSuppliers } from '../services/supplierService.js'
import { getPurchaseError } from '../utils/purchaseError.js'

export default function usePurchaseOptions(enabled) {
  const [state, setState] = useState({ products: [], suppliers: [], loading: enabled, error: '' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let current = true
    Promise.all([getAllProducts(), getAllSuppliers()]).then(([products, suppliers]) => {
      if (current) setState({ products, suppliers, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ products: [], suppliers: [], loading: false, error: getPurchaseError(cause) })
    })
    return () => { current = false }
  }, [enabled, revision])

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }
  return { ...state, reload }
}
