import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ApplicationType, type JobType, mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseEditDeploymentRestrictionProps {
  serviceId: string
  serviceType: ApplicationType | JobType
}

export function useEditDeploymentRestriction({ serviceId, serviceType }: UseEditDeploymentRestrictionProps) {
  const queryClient = useQueryClient()
  return useMutation(mutations.editDeploymentRestriction, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentRestrictions({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Deployment restriction updated',
      },
      notifyOnError: true,
    },
  })
}

export default useEditDeploymentRestriction
