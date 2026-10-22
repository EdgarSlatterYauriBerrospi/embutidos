import { useEffect, useMemo, useState } from 'react'
import { getAllProducts } from '../services/productService.js'
import { availableProducts } from '../utils/saleRules.js'
import { getProductError } from '../utils/productError.js'

export default function useSaleProducts() {
  const [state, setState] = useState({ products: [], loading: true, error: '' })
  const [query, setQuery] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let current = true
    getAllProducts().then((products) => current && setState({ products, loading: false, error: '' })).catch((cause) => current && setState({ products: [], loading: false, error: getProductError(cause) }))
    return () => { current = false }
  }, [revision])
  function reload() { setState((old) => ({ ...old, loading: true, error: '' })); setRevision((old) => old + 1) }
  const products = useMemo(() => availableProducts(state.products, query), [state.products, query])
  return { ...state, products, query, setQuery, reload }
}
