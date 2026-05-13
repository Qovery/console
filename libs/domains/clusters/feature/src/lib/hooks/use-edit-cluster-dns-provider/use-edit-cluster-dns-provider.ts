import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditClusterDnsProvider() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editDnsProvider, {
    onSuccess(_, { clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.dnsProvider({ clusterId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'DNS provider updated',
        description: 'The DNS provider configuration has been saved.',
      },
      notifyOnError: false,
    },
  })
}
