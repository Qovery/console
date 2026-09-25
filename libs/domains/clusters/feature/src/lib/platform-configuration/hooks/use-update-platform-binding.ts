import { useMutation, useQueryClient } from '@tanstack/react-query'
import { platformConfigurationMutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useUpdatePlatformBinding() {
  const queryClient = useQueryClient()

  return useMutation(platformConfigurationMutations.updateBinding, {
    onSuccess(binding, { organizationId, clusterId }) {
      queryClient.setQueryData(queries.platformConfiguration.binding({ organizationId, clusterId }).queryKey, binding)
    },
    meta: {
      notifyOnError: true,
    },
  })
}
