import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteDeploymentRestriction() {
  const queryClient = useQueryClient()
  return useMutation(mutations.deleteDeploymentRestriction, {
    onSuccess(_, { serviceId, serviceType }) {
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
