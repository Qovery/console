import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditService() {
  const queryClient = useQueryClient()
  // const { mutateAsync: deployCluster } = useDeployCluster()

  return useMutation(mutations.editService, {
    onSuccess(_, { serviceType, serviceId }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.details({ serviceType, serviceId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess(_: unknown, variables: unknown) {
        const { serviceId } = variables as Parameters<typeof mutations.editService>[0]
        return {
          title: 'Service updated',
          description: 'You must update to apply the settings',
          callback() {
            console.log(serviceId)
            // deployCluster({ organizationId, clusterId })
          },
          labelAction: 'Update',
        }
      },
      notifyOnError: true,
    },
  })
}

export default useEditService
