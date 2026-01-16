import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queries } from '@qovery/domains-services/data-access'
import { type ServiceType } from '@qovery/domains-services/data-access'
import { type WebhookStatusState, type WebhookStatusType } from './webhook-status-types'

export function useWebhookStatus({
  serviceId,
  serviceType,
  enabled = true,
}: {
  serviceId: string
  serviceType: ServiceType
  enabled?: boolean
}): WebhookStatusState {
  const { data, isLoading, error } = useQuery(
    queries.services.webhookStatus({
      serviceId,
      serviceType,
    })
  )

  // Memoize the state to prevent unnecessary re-renders
  return useMemo(() => {
    if (isLoading) {
      return {
        status: 'CHECKING' as WebhookStatusType,
        message: 'Verifying webhook status...',
        lastChecked: new Date(),
        isLoading: true,
      }
    }

    if (error) {
      return {
        status: 'STATUS_UNAVAILABLE' as WebhookStatusType,
        message: 'Could not determine webhook status. Please try refreshing the page.',
        lastChecked: new Date(),
        isLoading: false,
        error,
      }
    }

    if (!data) {
      return {
        status: 'CHECKING' as WebhookStatusType,
        message: 'Verifying webhook status...',
        lastChecked: new Date(),
        isLoading: false,
      }
    }

    return {
      status: data.status as WebhookStatusType,
      message: data.message,
      lastChecked: data.lastChecked,
      isLoading: false,
    }
  }, [data, isLoading, error])
}
