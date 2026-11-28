import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ImpactedServiceResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/custom-domains/data-access'
import { isHttpStatus } from '@qovery/shared/utils'
import {
  describeServiceCount,
  invalidateCustomDomainServices,
  redeployCustomDomainServices,
} from '../../utils/impacted-services'

export interface DeleteOrganizationCustomDomainVariables {
  environmentId: string
  domainName: string
}

// Deletes every copy of the domain in its environment at once.
export function useDeleteOrganizationCustomDomain() {
  const queryClient = useQueryClient()

  return useMutation(
    async (variables: DeleteOrganizationCustomDomainVariables): Promise<ImpactedServiceResponse[]> => {
      try {
        const { impacted_services } = await mutations.deleteEnvironmentCustomDomain(variables)
        return impacted_services
      } catch (error) {
        // Already deleted, for example from another tab: the list is refreshed below.
        if (isHttpStatus(error, 404)) return []
        throw error
      }
    },
    {
      onSuccess(impactedServices) {
        invalidateCustomDomainServices(queryClient, impactedServices)
      },
      meta: {
        notifyOnSuccess(data: unknown) {
          const impactedServices = data as ImpactedServiceResponse[]
          if (!impactedServices.length) return { title: 'Your domain has been deleted' }
          return {
            title: 'Your domain has been deleted',
            description: `Redeploy ${describeServiceCount(impactedServices)} to apply the change.`,
            labelAction: 'Redeploy',
            callback: () => redeployCustomDomainServices(queryClient, impactedServices, { announce: true }),
          }
        },
        notifyOnError: { title: 'Your domain could not be deleted' },
      },
    }
  )
}

export default useDeleteOrganizationCustomDomain
