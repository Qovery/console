import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseKubernetesServicesProps {
  helmId: string
}

export function useKubernetesServices({ helmId }: UseKubernetesServicesProps) {
  return useQuery({
    ...queries.serviceHelm.listKubernetesServices({
      helmId,
    }),
  })
}

export default useKubernetesServices
