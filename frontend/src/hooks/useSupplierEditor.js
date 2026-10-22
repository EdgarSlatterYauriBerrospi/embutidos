import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSupplier, deactivateSupplier, getSupplierById, updateSupplier } from '../services/supplierService.js'
import { getSupplierError } from '../utils/supplierError.js'
import { emptySupplierForm, toSupplierForm, validateSupplier } from '../utils/supplierRules.js'

export default function useSupplierEditor(id) {
  const navigate = useNavigate()
  const pending = useRef(false)
  const [state, setState] = useState({ values: emptySupplierForm, active: true, loading: Boolean(id), error: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!id) return
    let current = true
    getSupplierById(id).then((supplier) => {
      if (current) setState({ values: toSupplierForm(supplier), active: supplier.active, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ values: emptySupplierForm, active: true, loading: false, error: getSupplierError(cause) })
    })
    return () => { current = false }
  }, [id, revision])

  function change(field, value) {
    setState((previous) => ({ ...previous, values: { ...previous.values, [field]: value } }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  async function run(operation, successMessage) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setState((previous) => ({ ...previous, error: '' }))
    try {
      await operation()
      navigate('/suppliers', { replace: true, state: { supplierSuccess: successMessage } })
    } catch (cause) {
      setState((previous) => ({ ...previous, error: getSupplierError(cause) }))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function save(event) {
    event.preventDefault()
    if (pending.current || state.loading) return
    const nextErrors = validateSupplier(state.values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    return run(() => id ? updateSupplier(id, state.values) : createSupplier(state.values), id ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.')
  }

  function deactivate() {
    if (!id || !state.active || state.loading || pending.current) return
    return run(() => deactivateSupplier(id), 'Proveedor desactivado correctamente.')
  }

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }

  return { ...state, errors, busy, change, save, deactivate, reload }
}
