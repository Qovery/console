import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useAvailableHelmRepositories() {
  return useQuery({
    ...queries.organizations.availableHelmRepositories,
  })
}

export default useAvailableHelmRepositories
