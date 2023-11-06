import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCreateWebhookProps {
  organizationId: string
}

export function useCreateWebhook({ organizationId }: UseCreateWebhookProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createWebhook, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.webhooks({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your webhooks is being created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateWebhook
