import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type CustomDomainDeletionResponse, type EnvironmentCustomDomainRequest } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/custom-domains/data-access'
import {
  describeServiceCount,
  invalidateCustomDomainServices,
  redeployCustomDomainServices,
} from '../../utils/impacted-services'

export interface EditOrganizationCustomDomainVariables {
  environmentId: string
  // The current name: the payload may rename the domain.
  domainName: string
  // `services` lists the services that keep serving the domain. An empty list deletes it.
  payload: EnvironmentCustomDomainRequest
  redeploy: boolean
}

// Edits every copy of the domain in its environment at once: all of them change, or none.
export function useEditOrganizationCustomDomain() {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ environmentId, domainName, payload }: EditOrganizationCustomDomainVariables) => {
      const { impacted_services }: CustomDomainDeletionResponse = payload.services.length
        ? await mutations.editEnvironmentCustomDomain({ environmentId, domainName, payload })
        : await mutations.deleteEnvironmentCustomDomain({ environmentId, domainName })
      return impacted_services
    },
    {
      onSuccess(impactedServices, { redeploy }) {
        invalidateCustomDomainServices(queryClient, impactedServices)
        if (redeploy) redeployCustomDomainServices(queryClient, impactedServices)
      },
      meta: {
        notifyOnSuccess(data: unknown, variables: unknown) {
          const impactedServices = data as CustomDomainDeletionResponse['impacted_services']
          const { payload, redeploy } = variables as EditOrganizationCustomDomainVariables
          const title = payload.services.length ? 'Your domain has been updated' : 'Your domain has been deleted'
          const services = describeServiceCount(impactedServices)
          if (redeploy) return { title, description: `Redeploying ${services}.` }
          return {
            title,
            description: `Redeploy ${services} to apply the change.`,
            labelAction: 'Redeploy',
            callback: () => redeployCustomDomainServices(queryClient, impactedServices, { announce: true }),
          }
        },
        // Conflicts and other errors are shown in the edit modal.
        notifyOnError: false,
      },
    }
  )
}

export default useEditOrganizationCustomDomain
