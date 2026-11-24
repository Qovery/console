import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type EnvironmentCustomDomainResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/custom-domains/data-access'
import { mutations as serviceMutations } from '@qovery/domains/services/data-access'
import { pluralize } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

type RedeployableServiceType = Parameters<typeof serviceMutations.deployService>[0]['serviceType']

// Creates one domain on several services of an environment at once. Nothing is deployed by the API.
export function useCreateEnvironmentCustomDomain({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  const redeploy = (impactedServices: EnvironmentCustomDomainResponse['impacted_services']) =>
    Promise.all(
      impactedServices.map(({ id, type }) =>
        serviceMutations.deployService({ serviceId: id, serviceType: type as RedeployableServiceType })
      )
    ).then(() => queryClient.invalidateQueries({ queryKey: queries.services.listStatuses(environmentId).queryKey }))

  return useMutation(mutations.createEnvironmentCustomDomain, {
    onSuccess({ impacted_services }) {
      queryClient.invalidateQueries({ queryKey: queries.customDomains.organizationList._def })
      impacted_services.forEach(({ id, type }) => {
        if (type !== 'APPLICATION' && type !== 'CONTAINER' && type !== 'HELM') return
        queryClient.invalidateQueries({
          queryKey: queries.services.customDomains({ serviceId: id, serviceType: type }).queryKey,
        })
        queryClient.invalidateQueries({
          queryKey: queries.services.listLinks({ serviceId: id, serviceType: type }).queryKey,
        })
      })
    },
    meta: {
      notifyOnSuccess(data: unknown) {
        const { domain, impacted_services } = data as EnvironmentCustomDomainResponse
        const count = impacted_services.length
        return {
          title: `${domain} created`,
          description: `Its certificate is issued once the CNAME record resolves. Redeploy ${count} ${pluralize(count, 'service')} to serve it.`,
          labelAction: 'Redeploy',
          callback() {
            redeploy(impacted_services)
          },
        }
      },
      // Conflicts are shown next to the routes they concern.
      notifyOnError: false,
    },
  })
}

export default useCreateEnvironmentCustomDomain
