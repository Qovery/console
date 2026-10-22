import { useMutation, useQueryClient } from '@tanstack/react-query'
import { platformConfigurationMutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useUpdatePlatformConfiguration() {
  const queryClient = useQueryClient()

  return useMutation(platformConfigurationMutations.updateConfiguration, {
    onSuccess(configuration, { clusterId }) {
      queryClient.setQueryData(queries.platformConfiguration.configuration({ clusterId }).queryKey, configuration)
    },
    meta: {
      notifyOnError: true,
    },
  })
}
