import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export interface UseSyncGitWebhookProps {
  serviceId: string
}

export function useSyncGitWebhook({ serviceId }: UseSyncGitWebhookProps) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => mutations.syncGitWebhook({ serviceId }),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.gitWebhookStatus(serviceId).queryKey,
      })
      toast('SUCCESS', 'Webhook synchronized successfully')
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useSyncGitWebhook
