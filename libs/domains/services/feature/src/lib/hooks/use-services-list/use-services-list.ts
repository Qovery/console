import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesListProps {
  environmentId?: string
  suspense?: boolean
}

export function useServicesList({ environmentId, suspense = false }: UseServicesListProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    select(services) {
      services.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return services
    },
    enabled: Boolean(environmentId),
    suspense,
  })
}

export default useServicesList
