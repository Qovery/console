import { useQuery } from '@tanstack/react-query'
import {
  type ApplicationType,
  type ContainerType,
  type HelmType,
  type JobType,
  type TerraformType,
} from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeploymentRestrictionsProps {
  serviceId: string
  serviceType: ApplicationType | ContainerType | JobType | HelmType | TerraformType
}

export function useDeploymentRestrictions({ serviceId, serviceType }: UseDeploymentRestrictionsProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.deploymentRestrictions({ serviceId: serviceId!!, serviceType }),
    enabled: Boolean(serviceId),
  })
}

export default useDeploymentRestrictions
