import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmRepositoryProps {
  organizationId: string
  enabled?: boolean
}

export function useHelmRepository({ organizationId, enabled }: UseHelmRepositoryProps) {
  return useQuery({
    ...queries.serviceHelm.listHelmRepository({
      organizationId,
    }),
    select(data) {
      return data?.sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled,
  })
}

export default useHelmRepository
