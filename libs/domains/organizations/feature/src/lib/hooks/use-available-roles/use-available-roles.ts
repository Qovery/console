import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAvailableRolesProps {
  organizationId: string
  suspense?: boolean
}

export function useAvailableRoles({ organizationId, suspense = false }: UseAvailableRolesProps) {
  return useQuery({
    ...queries.organizations.availableRoles({ organizationId }),
    suspense,
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
    },
  })
}

export default useAvailableRoles
