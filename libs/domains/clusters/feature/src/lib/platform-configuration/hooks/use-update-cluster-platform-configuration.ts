import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isHttpStatus, platformConfigurationMutations } from '@qovery/domains/clusters/data-access'
import { toastError } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useUpdateClusterPlatformConfiguration() {
  const queryClient = useQueryClient()

  return useMutation(platformConfigurationMutations.updateClusterConfiguration, {
    onSuccess(configuration, { clusterId }) {
      queryClient.setQueryData(
        queries.platformConfiguration.clusterConfiguration({ clusterId }).queryKey,
        configuration
      )
      queryClient.invalidateQueries({ queryKey: queries.platformConfiguration.componentConfiguration._def })
      queryClient.invalidateQueries({
        queryKey: queries.clusterOperator.bootstrap({ organizationId: configuration.organizationId, clusterId })
          .queryKey,
      })
    },
    onError(error) {
      if (isHttpStatus(error, 409)) {
        toastError(
          error as Error,
          'Platform configuration not saved',
          'This cluster uses a platform profile it does not own, so its configuration cannot be changed from this cluster.'
        )
        return
      }
      toastError(error as Error)
    },
    meta: {
      notifyOnSuccess: {
        title: 'Platform configuration saved',
      },
      notifyOnError: false,
    },
  })
}
