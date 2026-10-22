import { useContext } from 'react'
import SaleDraftContext from '../context/SaleDraftContext.js'

export default function useSaleDraft() {
  const value = useContext(SaleDraftContext)
  if (!value) throw new Error('useSaleDraft must be used within SaleDraftProvider')
  return value
}
