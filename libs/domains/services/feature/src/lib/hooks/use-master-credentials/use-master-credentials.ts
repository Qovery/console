import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseMasterCredentialsProps {
  serviceId: string
  serviceType?: ServiceType
}

export function useMasterCredentials({ serviceId, serviceType }: UseMasterCredentialsProps) {
  return useQuery({
    ...queries.services.masterCredentials({ serviceId, serviceType: 'DATABASE' }),
    enabled: serviceType === 'DATABASE',
  })
}

export default useMasterCredentials
