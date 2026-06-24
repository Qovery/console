import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from '@tanstack/react-query'

async function fetchRdeAccess(organizationId: string, token: string): Promise<boolean> {
  const response = await fetch(`https://rde.qovery.com/api/orgs/${organizationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.ok
}

export function useRdeAccess({ organizationId }: { organizationId: string }) {
  const { getAccessTokenSilently } = useAuth0()

  return useQuery({
    queryKey: ['rde-access', organizationId],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return fetchRdeAccess(organizationId, token)
    },
    staleTime: 5 * 60 * 1000,
  })
}
