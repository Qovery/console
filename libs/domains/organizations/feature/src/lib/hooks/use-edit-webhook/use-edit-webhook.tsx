import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseEditWebhookProps {
  organizationId: string
}

export function useEditWebhook({ organizationId }: UseEditWebhookProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.editWebhook, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.webhooks({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your webhook is being edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditWebhook
