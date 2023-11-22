import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useOrganizations({ enabled }: { enabled?: boolean } = {}) {
  return useQuery({
    ...queries.organizations.list,
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
  })
}

export default useOrganizations
