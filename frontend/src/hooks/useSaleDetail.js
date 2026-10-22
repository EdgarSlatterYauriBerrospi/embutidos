import { useEffect, useMemo, useState } from 'react'
import { cancelSale, getAllSales, getSaleById } from '../services/saleService.js'
import { getAllProducts } from '../services/productService.js'
import { getSaleError } from '../utils/saleError.js'
import { createEmployeeSaleSequence } from '../utils/saleRules.js'

export default function useSaleDetail(id, employeeUserId) {
  const [state, setState] = useState({ sale: null, products: [], employeeSales: [], loading: true, error: '' })
  const [revision, setRevision] = useState(0)
  const [cancellation, setCancellation] = useState({ submitting: false, error: '' })
  useEffect(() => {
    let current = true
    const employeeSalesRequest = employeeUserId ? getAllSales() : Promise.resolve([])
    Promise.all([getSaleById(id), getAllProducts(), employeeSalesRequest]).then(([sale, products, employeeSales]) => current && setState({ sale, products, employeeSales, loading: false, error: '' })).catch((cause) => current && setState({ sale: null, products: [], employeeSales: [], loading: false, error: getSaleError(cause) }))
    return () => { current = false }
  }, [id, employeeUserId, revision])
  const productById = useMemo(() => new Map(state.products.map((product) => [product.id, product])), [state.products])
  const employeeNumber = useMemo(() => employeeUserId
    ? createEmployeeSaleSequence(state.employeeSales, employeeUserId).get(String(id))
    : undefined, [state.employeeSales, employeeUserId, id])
  function reload() { setState((old) => ({ ...old, loading: true, error: '' })); setRevision((old) => old + 1) }
  async function cancel(reason) {
    setCancellation({ submitting: true, error: '' })
    try {
      const sale = await cancelSale(id, reason)
      setState((current) => ({ ...current, sale }))
      setCancellation({ submitting: false, error: '' })
      return sale
    } catch (cause) {
      setCancellation({ submitting: false, error: getSaleError(cause) })
      throw cause
    }
  }
  return { ...state, productById, employeeNumber, reload, cancel, cancellation }
}
