import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations, queries, type ServiceType } from '@qovery/domains-services/data-access'

export function useResyncWebhook({ serviceId, serviceType }: { serviceId: string; serviceType: ServiceType }) {
  const queryClient = useQueryClient()

  return useMutation(
    () =>
      mutations.resyncWebhook({
        serviceId,
        serviceType,
      }),
    {
      onSuccess: () => {
        // Invalidate the webhook status query to trigger a refresh
        queryClient.invalidateQueries(
          queries.services.webhookStatus({
            serviceId,
            serviceType,
          }).queryKey
        )
      },
      meta: {
        notifyOnSuccess: 'Webhook synced successfully',
        notifyOnError: 'Failed to sync webhook. Please try again.',
      },
    }
  )
}
