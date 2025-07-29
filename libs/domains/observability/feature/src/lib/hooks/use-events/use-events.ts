import { useQuery } from '@tanstack/react-query'
import {
  OrganizationEventApi,
  type OrganizationEventResponse,
  type OrganizationEventTargetType,
} from 'qovery-typescript-axios'
import { toastError } from '@qovery/shared/ui'

const eventsApi = new OrganizationEventApi()

// https://api.qovery.com/organization/460616f0-94da-4d35-b631-6fa4ed08eb9a/events?pageSize=30&targetType=CONTAINER&targetId=02085927-12dd-40ef-a155-8f1583ffc7a3
export function useEvents({
  organizationId,
  serviceId,
  targetType,
  toTimestamp,
  fromTimestamp,
}: {
  organizationId: string
  serviceId: string
  targetType: OrganizationEventTargetType
  toTimestamp: string
  fromTimestamp: string
}) {
  return useQuery<OrganizationEventResponse[], Error>(
    ['organization', organizationId, 'events', serviceId, targetType, toTimestamp, fromTimestamp],
    async () => {
      const response = await eventsApi.getOrganizationEvents(
        organizationId,
        100,
        fromTimestamp,
        toTimestamp,
        undefined,
        undefined,
        undefined,
        targetType,
        undefined,
        undefined,
        undefined,
        undefined
      )
      return response.data.events ?? []
    },
    {
      onError: (err) => toastError(err),
    }
  )
}

export default useEvents
