import { type QueryClient } from '@tanstack/react-query'
import { type ImpactedServiceResponse } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

type CustomDomainServiceType = 'APPLICATION' | 'CONTAINER' | 'HELM'

interface CustomDomainService {
  id: string
  type: CustomDomainServiceType
}

// Only applications, containers and Helm charts have custom domains.
const getCustomDomainServices = (services: ImpactedServiceResponse[]) =>
  services.filter((service): service is CustomDomainService =>
    ['APPLICATION', 'CONTAINER', 'HELM'].includes(service.type)
  )

export const describeServiceCount = (services: ImpactedServiceResponse[]) => {
  const count = getCustomDomainServices(services).length
  return `${count} ${pluralize(count, 'service')}`
}

export function invalidateCustomDomainServices(queryClient: QueryClient, services: ImpactedServiceResponse[]) {
  queryClient.invalidateQueries({ queryKey: queries.customDomains.organizationList._def })
  getCustomDomainServices(services).forEach(({ id, type }) => {
    queryClient.invalidateQueries({
      queryKey: queries.services.customDomains({ serviceId: id, serviceType: type }).queryKey,
    })
    queryClient.invalidateQueries({
      queryKey: queries.services.listLinks({ serviceId: id, serviceType: type }).queryKey,
    })
  })
}

// Custom domain changes are applied by a redeploy. Never rejects: failures are reported in a toast that retries them.
export async function redeployCustomDomainServices(
  queryClient: QueryClient,
  services: ImpactedServiceResponse[],
  { announce = false }: { announce?: boolean } = {}
): Promise<void> {
  const targets = getCustomDomainServices(services)
  if (!targets.length) return
  const results = await Promise.allSettled(
    targets.map(({ id, type }) => mutations.deployService({ serviceId: id, serviceType: type }))
  )
  queryClient.invalidateQueries({ queryKey: queries.services.listStatuses._def })
  targets.forEach(({ id, type }) =>
    queryClient.invalidateQueries({ queryKey: queries.services.status({ id, serviceType: type }).queryKey })
  )
  const failed = targets.filter((_, index) => results[index].status === 'rejected')
  if (!failed.length) {
    if (announce) toast('success', `Redeploying ${describeServiceCount(targets)}`)
    return
  }
  const reason = results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []))[0]
  // API errors reach here as `{ message }` objects, not always `Error` instances.
  const message = (reason as { message?: string } | undefined)?.message
  toast(
    'error',
    `${failed.length} of ${targets.length} ${pluralize(targets.length, 'service')} could not be redeployed`,
    message,
    () => redeployCustomDomainServices(queryClient, failed, { announce: true }),
    'Retry'
  )
}
