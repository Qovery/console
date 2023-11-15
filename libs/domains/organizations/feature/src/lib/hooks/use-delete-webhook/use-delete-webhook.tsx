import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteWebhook() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteWebhook, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.webhooks({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your webhook has been deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteWebhook
