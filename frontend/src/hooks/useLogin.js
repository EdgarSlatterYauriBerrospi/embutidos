import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from './useAuth.js'
import { getLoginErrorMessage } from '../utils/loginError.js'

export default function useLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const pending = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submitLogin(formData) {
    if (pending.current) return
    pending.current = true
    setIsSubmitting(true)
    setError('')

    try {
      await login(formData.get('email'), formData.get('password'), formData.get('rememberMe') === 'on')
      navigate('/dashboard', { replace: true })
    } catch (cause) {
      setError(getLoginErrorMessage(cause))
    } finally {
      pending.current = false
      setIsSubmitting(false)
    }
  }

  return { submitLogin, isSubmitting, error }
}
