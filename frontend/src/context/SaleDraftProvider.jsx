import { useCallback, useMemo, useState } from 'react'
import SaleDraftContext from './SaleDraftContext.js'
import { addCartProduct, removeCartProduct, setCartQuantity } from '../utils/saleRules.js'

export default function SaleDraftProvider({ children }) {
  const [lines, setLines] = useState([])
  const [completedSale, setCompletedSale] = useState(null)
  const addProduct = useCallback((product) => setLines((current) => addCartProduct(current, product)), [])
  const setQuantity = useCallback((productId, quantity) => setLines((current) => setCartQuantity(current, productId, quantity)), [])
  const removeProduct = useCallback((productId) => setLines((current) => removeCartProduct(current, productId)), [])
  const reset = useCallback(() => { setLines([]); setCompletedSale(null) }, [])
  const complete = useCallback((sale) => { setCompletedSale(sale); setLines([]) }, [])
  const value = useMemo(() => ({ lines, completedSale, addProduct, setQuantity, removeProduct, reset, complete }), [lines, completedSale, addProduct, setQuantity, removeProduct, reset, complete])
  return <SaleDraftContext.Provider value={value}>{children}</SaleDraftContext.Provider>
}
