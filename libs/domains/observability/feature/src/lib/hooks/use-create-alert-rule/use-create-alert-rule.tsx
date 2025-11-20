import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/observability/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateAlertRule({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createAlertRule, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queries.observability.alertRules({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}
