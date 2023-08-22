import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ApplicationType, mutations } from '@qovery/domains/services/data-access'
import { toastError } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export interface UseDeleteDeploymentRestrictionProps {
  serviceId: string
  serviceType: ApplicationType
}

export function useDeleteDeploymentRestriction({ serviceId, serviceType }: UseDeleteDeploymentRestrictionProps) {
  const queryClient = useQueryClient()
  return useMutation(mutations.deleteDeploymentRestriction, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentRestrictions({ serviceId, serviceType }).queryKey,
      })
    },
    onError: (error: Error) => toastError(error),
  })
}

export default useDeleteDeploymentRestriction
