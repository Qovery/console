import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateDeploymentRestriction() {
  const queryClient = useQueryClient()
  return useMutation(mutations.createDeploymentRestriction, {
    onSuccess(_, { serviceId, serviceType }) {
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
