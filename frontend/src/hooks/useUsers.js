import { useEffect, useMemo, useState } from 'react'
import { getAllUsers } from '../services/userService.js'
import { getUserError } from '../utils/userError.js'
import { filterUsers } from '../utils/userRules.js'

export default function useUsers(enabled) {
  const [state, setState] = useState({ allUsers: [], loading: enabled, error: '' })
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let current = true
    getAllUsers().then((allUsers) => {
      if (current) setState({ allUsers, loading: false, error: '' })
    }).catch((cause) => {
      if (current) setState({ allUsers: [], loading: false, error: getUserError(cause) })
    })
    return () => { current = false }
  }, [enabled, revision])

  const users = useMemo(() => filterUsers(state.allUsers, query, role, status), [state.allUsers, query, role, status])
  function reload() {
    setState((previous) => ({ ...previous, loading: true, error: '' }))
    setRevision((previous) => previous + 1)
  }
  return { ...state, users, query, setQuery, role, setRole, status, setStatus, reload }
}
