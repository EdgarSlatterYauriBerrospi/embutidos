import { useEffect, useMemo, useState } from 'react'
import { getAllProducts } from '../services/productService.js'
import { filterProducts } from '../utils/productRules.js'
import { getProductError } from '../utils/productError.js'

export default function useProducts() {
  const [state, setState] = useState({ products: [], loading: true, error: '' })
  const [query, setQuery] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let current = true
    getAllProducts().then((products) => {
      if (current) setState({ products, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ products: [], loading: false, error: getProductError(cause) })
    })
    return () => { current = false }
  }, [revision])

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }

  const products = useMemo(() => filterProducts(state.products, query), [state.products, query])
  return { ...state, allProducts: state.products, products, query, setQuery, reload }
}
