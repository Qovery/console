import { useQuery } from '@tanstack/react-query'
import { type Organization } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

export const organizationsQuery = {
  ...queries.organizations.list,
  select(data?: Organization[]) {
    if (!data) {
      return data
    }
    return data.sort((a, b) => a.name.localeCompare(b.name))
  },
}

export function useOrganizations({ enabled }: { enabled?: boolean } = {}) {
  return useQuery({
    ...organizationsQuery,
    enabled,
  })
}

export default useOrganizations
