import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type EnvironmentCustomDomainResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/custom-domains/data-access'
import {
  describeServiceCount,
  invalidateCustomDomainServices,
  redeployCustomDomainServices,
} from '../../utils/impacted-services'

// Creates one domain on several services of an environment at once. Nothing is deployed by the API.
export function useCreateEnvironmentCustomDomain() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createEnvironmentCustomDomain, {
    onSuccess({ impacted_services }) {
      invalidateCustomDomainServices(queryClient, impacted_services)
    },
    meta: {
      notifyOnSuccess(data: unknown) {
        const { domain, impacted_services } = data as EnvironmentCustomDomainResponse
        return {
          title: `${domain} created`,
          description: `Its certificate is issued once the CNAME record resolves. Redeploy ${describeServiceCount(impacted_services)} to serve it.`,
          labelAction: 'Redeploy',
          callback: () => redeployCustomDomainServices(queryClient, impacted_services, { announce: true }),
        }
      },
      // Conflicts are shown next to the routes they concern.
      notifyOnError: false,
    },
  })
}

export default useCreateEnvironmentCustomDomain
