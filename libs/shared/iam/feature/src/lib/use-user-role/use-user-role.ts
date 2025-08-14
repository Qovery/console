import { useAuth0 } from '@auth0/auth0-react'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'

const AUTH0_NAMESPACE = 'https://qovery.com/roles'

export function useUserRole() {
  const { getAccessTokenSilently } = useAuth0()
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const isQoveryAdminUser = roles.some((r) => r === 'admin')

  const isAdminOrOwnerOfCompany = (companyId: string) => {
    return (
      roles.some((role) => role.includes(`organization:${companyId}:admin`)) ||
      roles.some((role) => role.includes(`organization:${companyId}:owner`))
    )
  }

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = await getAccessTokenSilently()
        const tokenDecoded: { [AUTH0_NAMESPACE]: string[] } = jwtDecode(token)
        setRoles(tokenDecoded[AUTH0_NAMESPACE])
      } catch (error) {
        console.error('Error fetching roles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [getAccessTokenSilently])

  return {
    roles,
    loading,
    isQoveryAdminUser,
    isAdminOrOwnerOfCompany,
  }
}

export default useUserRole
