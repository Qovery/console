import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ApplicationType, type JobType, mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeleteDeploymentRestrictionProps {
  serviceId: string
  serviceType: ApplicationType | JobType
}

export function useDeleteDeploymentRestriction({ serviceId, serviceType }: UseDeleteDeploymentRestrictionProps) {
  const queryClient = useQueryClient()
  return useMutation(mutations.deleteDeploymentRestriction, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentRestrictions({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useDeleteDeploymentRestriction
