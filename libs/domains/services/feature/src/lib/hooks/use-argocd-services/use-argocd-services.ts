import { useQuery } from '@tanstack/react-query'
import { services } from '@qovery/domains/services/data-access'

export interface UseArgoCdServicesProps {
  environmentId?: string
  suspense?: boolean
}

export function useArgoCdServices({ environmentId, suspense = false }: UseArgoCdServicesProps) {
  return useQuery({
    ...services.listArgoCdServices(environmentId!),
    enabled: Boolean(environmentId),
    select(services) {
      return services.sort((serviceA, serviceB) => serviceA.name.localeCompare(serviceB.name))
    },
    suspense,
  })
}

export default useArgoCdServices
