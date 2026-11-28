import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ImpactedServiceResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/custom-domains/data-access'
import {
  describeServiceCount,
  invalidateCustomDomainServices,
  redeployCustomDomainServices,
} from '../../utils/impacted-services'

// Deletes domains of several environments of the organization: all of them, or none.
export function useBulkDeleteOrganizationCustomDomains() {
  const queryClient = useQueryClient()

  return useMutation(
    async (variables: Parameters<typeof mutations.bulkDeleteOrganizationCustomDomain>[0]) => {
      const { impacted_services } = await mutations.bulkDeleteOrganizationCustomDomain(variables)
      return impacted_services
    },
    {
      onSuccess(impactedServices) {
        invalidateCustomDomainServices(queryClient, impactedServices)
      },
      onError() {
        // Nothing was deleted, but a domain the list still shows may already be gone.
        invalidateCustomDomainServices(queryClient, [])
      },
      meta: {
        notifyOnSuccess(data: unknown) {
          const impactedServices = data as ImpactedServiceResponse[]
          if (!impactedServices.length) return { title: 'Selected domains deleted' }
          return {
            title: 'Selected domains deleted',
            description: `Redeploy ${describeServiceCount(impactedServices)} to apply the changes.`,
            labelAction: 'Redeploy',
            callback: () => redeployCustomDomainServices(queryClient, impactedServices, { announce: true }),
          }
        },
        notifyOnError: { title: 'No domain was deleted' },
      },
    }
  )
}

export default useBulkDeleteOrganizationCustomDomains
