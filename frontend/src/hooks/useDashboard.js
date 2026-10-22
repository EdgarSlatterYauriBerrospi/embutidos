import { useEffect, useMemo, useState } from 'react'
import useAuth from './useAuth.js'
import { getDashboardSources } from '../services/dashboardService.js'
import { buildDashboardData } from '../utils/dashboardData.js'

const INITIAL_STATE = {
  sources: {},
  errors: {},
  loading: true,
}

export default function useDashboard() {
  const { user } = useAuth()
  const [state, setState] = useState(INITIAL_STATE)

  useEffect(() => {
    let active = true

    getDashboardSources({ includeAdminData: user?.role === 'ADMIN' }).then((result) => {
      if (active) setState({ sources: result.data, errors: result.errors, loading: false })
    }).catch(() => {
      if (active) {
        const message = 'No se pudo cargar la información del dashboard.'
        setState({
          sources: {},
          errors: {
            activity: message,
            batches: message,
            products: message,
            sales: message,
          },
          loading: false,
        })
      }
    })

    return () => {
      active = false
    }
  }, [user?.role])

  const data = useMemo(
    () => buildDashboardData(state.sources, user),
    [state.sources, user],
  )

  const errors = useMemo(() => {
    const activitySources = user?.role === 'ADMIN' ? ['sales', 'purchases', 'movements'] : ['sales']
    const activityErrors = activitySources.filter(
      (source) => state.errors[source],
    )

    return {
      ...state.errors,
      activity:
        activityErrors.length === activitySources.length
          ? user?.role === 'EMPLOYEE'
            ? 'No se pudo cargar tu actividad reciente.'
            : 'No se pudo cargar la actividad reciente.'
          : activityErrors.length
            ? 'Parte de la actividad reciente no pudo cargarse.'
            : '',
    }
  }, [state.errors, user?.role])

  return { data, errors, loading: state.loading }
}
