import { useEffect, useState } from 'react'

export interface Auth0Error {
  error: string
  error_description?: string
}

export function useAuth0Error() {
  const [auth0Error, setAuth0Error] = useState<Auth0Error | null>(null)

  useEffect(() => {
    // Check sessionStorage for Auth0 errors
    const error = sessionStorage.getItem('auth0_error')
    const errorDescription = sessionStorage.getItem('auth0_error_description')

    if (error) {
      setAuth0Error({
        error,
        error_description: errorDescription || 'NO_DESCRIPTION',
      })

      sessionStorage.removeItem('auth0_error')
      sessionStorage.removeItem('auth0_error_description')
    }
  }, [])

  return { auth0Error, setAuth0Error }
}

export default useAuth0Error
