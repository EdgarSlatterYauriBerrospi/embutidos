import { useRef, useState } from 'react'
import { createPurchase } from '../services/purchaseService.js'
import { getPurchaseError } from '../utils/purchaseError.js'
import { validatePurchase } from '../utils/purchaseRules.js'

function localDateToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function usePurchaseForm(userId, onCompleted) {
  const [supplierId, setSupplierId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [lines, setLines] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(null)
  const nextKey = useRef(0)
  const pending = useRef(false)

  function addProduct(product) {
    nextKey.current += 1
    setLines((previous) => [...previous, {
      key: nextKey.current,
      productId: product.id,
      quantity: '1',
      unitCost: '',
      entryDate: localDateToday(),
      expirationDate: '',
    }])
    setError('')
  }

  function updateLine(key, field, value) {
    setLines((previous) => previous.map((line) => line.key === key ? { ...line, [field]: value } : line))
    setError('')
  }

  function changeQuantity(key, difference) {
    setLines((previous) => previous.map((line) => line.key === key
      ? { ...line, quantity: String(Math.max(1, Math.min(2147483647, (Number(line.quantity) || 0) + difference))) }
      : line))
    setError('')
  }

  function removeLine(key) {
    setLines((previous) => previous.filter((line) => line.key !== key))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    const request = { supplierId, userId, invoiceNumber, lines }
    const validationError = validatePurchase(request)
    if (validationError) { setError(validationError); return }
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const purchase = await createPurchase(request)
      setCompleted(purchase)
      Promise.resolve(onCompleted?.()).catch(() => {})
    } catch (cause) {
      setError(getPurchaseError(cause))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return {
    supplierId, setSupplierId, invoiceNumber, setInvoiceNumber,
    lines, addProduct, updateLine, changeQuantity, removeLine,
    busy, error, completed, submit,
  }
}
