import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/observability/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateAlertReceiver({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createAlertReceiver, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queries.observability.alertReceivers({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}
