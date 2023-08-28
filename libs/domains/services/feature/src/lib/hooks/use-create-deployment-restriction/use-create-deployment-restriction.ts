import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ApplicationType, mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateDeploymentRestrictionProps {
  serviceId: string
  serviceType: ApplicationType
}

export function useCreateDeploymentRestriction({ serviceId, serviceType }: UseCreateDeploymentRestrictionProps) {
  const queryClient = useQueryClient()
  return useMutation(mutations.createDeploymentRestriction, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentRestrictions({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Deployment restriction created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateDeploymentRestriction
