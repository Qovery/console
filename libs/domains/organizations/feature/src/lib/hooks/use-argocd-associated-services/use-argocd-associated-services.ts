import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseArgoCdAssociatedServicesProps {
  clusterId: string
  suspense?: boolean
}

export function useArgoCdAssociatedServices({ clusterId, suspense = false }: UseArgoCdAssociatedServicesProps) {
  return useQuery({
    ...queries.organizations.argoCdAssociatedServices({ clusterId }),
    suspense,
  })
}

export default useArgoCdAssociatedServices
