import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useOrganizations({ enabled, suspense = false }: { enabled?: boolean; suspense?: boolean } = {}) {
  return useQuery({
    ...queries.organizations.list,
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
    suspense,
  })
}

export default useOrganizations
