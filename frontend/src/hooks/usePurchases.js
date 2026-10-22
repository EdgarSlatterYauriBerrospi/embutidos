import { useEffect, useState } from 'react'
import { getAllPurchases } from '../services/purchaseService.js'
import { getAllSuppliers } from '../services/supplierService.js'
import { getAllUsers } from '../services/userService.js'
import { getPurchaseError } from '../utils/purchaseError.js'

export default function usePurchases(enabled) {
  const [state, setState] = useState({ purchases: [], suppliers: [], users: [], loading: enabled, error: '' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let current = true
    async function load() {
      try {
        const purchases = await getAllPurchases()
        const [suppliers, users] = await Promise.allSettled([getAllSuppliers(), getAllUsers()])
        if (current) setState({
          purchases: [...purchases].sort((a, b) => String(b.purchaseDate).localeCompare(String(a.purchaseDate))),
          suppliers: suppliers.status === 'fulfilled' ? suppliers.value : [],
          users: users.status === 'fulfilled' ? users.value : [],
          loading: false,
          error: '',
        })
      } catch (cause) {
        if (current) setState({ purchases: [], suppliers: [], users: [], loading: false, error: getPurchaseError(cause) })
      }
    }
    load()
    return () => { current = false }
  }, [enabled, revision])

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }
  return { ...state, reload }
}
