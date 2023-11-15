import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateWebhook() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createWebhook, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.webhooks({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your webhooks has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateWebhook
