import { useQuery } from '@tanstack/react-query'
import { services } from '@qovery/domains/services/data-access'

export interface UseArgoCdManifestProps {
  serviceId?: string
  enabled?: boolean
  suspense?: boolean
}

export function useArgoCdManifest({ serviceId, enabled = true, suspense = false }: UseArgoCdManifestProps) {
  return useQuery({
    ...services.argocdManifest(serviceId ?? ''),
    enabled: Boolean(serviceId) && enabled,
    suspense,
  })
}

export default useArgoCdManifest
