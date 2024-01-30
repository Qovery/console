import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseAvailableRolesProps {
  organizationId: string
}

export function useAvailableRoles({ organizationId }: UseAvailableRolesProps) {
  return useQuery({
    ...queries.organizations.availableRoles({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
    },
  })
}

export default useAvailableRoles
