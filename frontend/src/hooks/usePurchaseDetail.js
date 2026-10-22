import { useEffect, useState } from 'react'
import { getPurchaseById } from '../services/purchaseService.js'
import { getAllProducts } from '../services/productService.js'
import { getAllSuppliers } from '../services/supplierService.js'
import { getAllUsers } from '../services/userService.js'
import { getPurchaseError } from '../utils/purchaseError.js'

export default function usePurchaseDetail(id, enabled) {
  const [state, setState] = useState({ purchase: null, products: [], suppliers: [], users: [], loading: enabled, error: '' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let current = true
    async function load() {
      try {
        const purchase = await getPurchaseById(id)
        const [products, suppliers, users] = await Promise.allSettled([getAllProducts(), getAllSuppliers(), getAllUsers()])
        if (current) setState({
          purchase,
          products: products.status === 'fulfilled' ? products.value : [],
          suppliers: suppliers.status === 'fulfilled' ? suppliers.value : [],
          users: users.status === 'fulfilled' ? users.value : [],
          loading: false,
          error: '',
        })
      } catch (cause) {
        if (current) setState({ purchase: null, products: [], suppliers: [], users: [], loading: false, error: getPurchaseError(cause) })
      }
    }
    load()
    return () => { current = false }
  }, [id, enabled, revision])

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }
  return { ...state, reload }
}
