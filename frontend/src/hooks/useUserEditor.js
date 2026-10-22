import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser, deactivateUser, getUserById, updateUser } from '../services/userService.js'
import { getUserError } from '../utils/userError.js'
import { emptyUserForm, toUserForm, validateUser } from '../utils/userRules.js'

export default function useUserEditor(id) {
  const navigate = useNavigate()
  const pending = useRef(false)
  const [state, setState] = useState({ user: null, values: emptyUserForm, active: true, loading: true, error: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let current = true
    const request = id ? getUserById(id) : Promise.resolve(null)
    request.then((user) => {
      if (current) setState({ user, values: user ? toUserForm(user) : emptyUserForm, active: user?.active ?? true, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ user: null, values: emptyUserForm, active: true, loading: false, error: getUserError(cause) })
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
      navigate('/users', { replace: true, state: { userSuccess: successMessage } })
    } catch (cause) {
      setState((previous) => ({ ...previous, error: getUserError(cause) }))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function save(event) {
    event.preventDefault()
    if (pending.current || state.loading) return
    const nextErrors = validateUser(state.values, Boolean(id))
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    return run(() => id ? updateUser(id, state.values) : createUser(state.values), id ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.')
  }

  function deactivate() {
    if (!id || !state.active || state.loading || pending.current) return
    return run(() => deactivateUser(id), 'Usuario desactivado correctamente.')
  }

  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }

  return { ...state, errors, busy, change, save, deactivate, reload }
}
