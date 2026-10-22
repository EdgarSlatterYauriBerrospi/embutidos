import { useEffect, useState } from 'react'
import { getProductById } from '../services/productService.js'
import { getStockError } from '../utils/stockError.js'

export default function useStockProduct(productId) {
  const [state, setState] = useState({ product: null, loading: true, error: '' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let current = true
    getProductById(productId).then((product) => {
      if (current) setState({ product, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ product: null, loading: false, error: getStockError(cause, 'el producto') })
    })
    return () => { current = false }
  }, [productId, revision])

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }

  return { ...state, reload }
}
