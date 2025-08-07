import { useEffect, useState } from 'react'

export interface Auth0Error {
  error: string
  error_description?: string
  state?: string
}

export function useAuth0Error() {
  const [auth0Error, setAuth0Error] = useState<Auth0Error | null>(null)

  useEffect(() => {
    // Check sessionStorage for Auth0 errors
    const error = sessionStorage.getItem('auth0_error')
    const errorDescription = sessionStorage.getItem('auth0_error_description')
    const state = sessionStorage.getItem('auth0_state')

    if (error) {
      setAuth0Error({
        error,
        error_description: errorDescription || undefined,
        state: state || undefined,
      })

      sessionStorage.removeItem('auth0_error')
      sessionStorage.removeItem('auth0_error_description')
    }
  }, [])

  const clearError = () => {
    setAuth0Error(null)
  }

  return { auth0Error, clearError }
}

export default useAuth0Error
