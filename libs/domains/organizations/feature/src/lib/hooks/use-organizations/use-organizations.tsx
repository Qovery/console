import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useOrganizations() {
  return useQuery({
    ...queries.organizations.list(),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export default useOrganizations
