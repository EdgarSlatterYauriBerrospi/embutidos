import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from './useAuth.js'
import { createProduct, deactivateProduct, getProductById, updateProduct } from '../services/productService.js'
import { canManageProducts, emptyProductForm, toProductForm, validateProduct } from '../utils/productRules.js'
import { getProductError } from '../utils/productError.js'

export default function useProductEditor(id) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canEdit = canManageProducts(user)
  const pending = useRef(false)
  const [state, setState] = useState({ key: id, values: emptyProductForm, active: true, loading: Boolean(id), error: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!id) return
    let current = true
    getProductById(id).then((product) => {
      if (current) setState({ key: id, values: toProductForm(product), active: product.active, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ key: id, values: emptyProductForm, active: true, loading: false, error: getProductError(cause) })
    })
    return () => { current = false }
  }, [id, revision])

  function change(field, value) {
    setState((previous) => ({ ...previous, values: { ...previous.values, [field]: value } }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  async function run(operation, message) {
    if (!canEdit || pending.current) return
    pending.current = true
    setBusy(true)
    setState((previous) => ({ ...previous, error: '' }))
    try {
      await operation()
      navigate('/products', { replace: true, state: { productSuccess: message } })
    } catch (cause) {
      setState((previous) => ({ ...previous, error: getProductError(cause) }))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function save(event) {
    event.preventDefault()
    if (!canEdit || busy || state.loading) return
    const nextErrors = validateProduct(state.values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    return run(() => id ? updateProduct(id, state.values) : createProduct(state.values), id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.')
  }

  function deactivate() {
    if (!id || !state.active || state.loading) return
    return run(() => deactivateProduct(id), 'Producto desactivado correctamente.')
  }

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }

  return { ...state, loading: state.key !== id || state.loading, errors, busy, canEdit, change, save, deactivate, reload }
}
