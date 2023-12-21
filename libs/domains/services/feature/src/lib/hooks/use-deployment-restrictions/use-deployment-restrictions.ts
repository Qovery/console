import { useQuery } from '@tanstack/react-query'
import { type ApplicationType, type HelmType, type JobType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentRestrictionsProps {
  serviceId: string
  serviceType: ApplicationType | JobType | HelmType
}

export function useDeploymentRestrictions({ serviceId, serviceType }: UseDeploymentRestrictionsProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.deploymentRestrictions({ serviceId: serviceId!!, serviceType }),
    enabled: Boolean(serviceId),
  })
}

export default useDeploymentRestrictions
