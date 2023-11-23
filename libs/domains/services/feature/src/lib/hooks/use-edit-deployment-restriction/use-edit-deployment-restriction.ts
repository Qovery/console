import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditDeploymentRestriction() {
  const queryClient = useQueryClient()
  return useMutation(mutations.editDeploymentRestriction, {
    onSuccess(_, { serviceId, serviceType }) {
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
