import { OrganizationEventApi, OrganizationEventResponseList } from 'qovery-typescript-axios'
import { useQuery } from 'react-query'
import { toastError } from '@qovery/shared/ui'

const eventsApi = new OrganizationEventApi()

export const useFetchEvents = (organizationId: string) => {
  return useQuery<OrganizationEventResponseList, Error>(
    ['organization', organizationId, 'events'],
    async () => {
      const response = await eventsApi.getOrganizationEvents(organizationId)
      return response.data
    },
    {
      onError: (err) => toastError(err),
    }
  )
}
