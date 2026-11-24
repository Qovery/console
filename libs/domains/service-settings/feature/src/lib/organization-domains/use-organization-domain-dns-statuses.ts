import { useQueries, useQueryClient } from '@tanstack/react-query'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { useCallback } from 'react'
import { queries } from '@qovery/state/util-queries'
import { getDomainSelectionKey, getDomainTargets } from '../utils/organization-domain-targets'
import { type DomainDnsStatus, getDomainDnsStatus } from '../utils/summarize-domain-dns-checks'

const DNS_CHECK_STALE_TIME = 5 * 60_000

const getDomainServices = (domains: OrganizationCustomDomainResponse[]) => [
  ...new Map(domains.flatMap(getDomainTargets).map(({ service }) => [service.id, service])).values(),
]

export interface DomainDnsStatusResult {
  status: DomainDnsStatus
  details: string[]
}

// The list API has no DNS status yet: derive it from the per-service DNS checks of the domains on screen.
// With `suspense`, the caller suspends until every check has settled, so it never renders a provisional status.
// Without it, `statuses` only holds domains whose checks have settled.
export function useOrganizationDomainDnsStatuses(
  domains: OrganizationCustomDomainResponse[],
  { suspense = false }: { suspense?: boolean } = {}
) {
  const queryClient = useQueryClient()
  const services = getDomainServices(domains)
  const results = useQueries({
    queries: services.map((service) => ({
      ...queries.services.checkCustomDomains({ serviceId: service.id, serviceType: service.type }),
      retry: false,
      staleTime: DNS_CHECK_STALE_TIME,
      refetchOnWindowFocus: false,
      suspense,
      // A failed check means "unknown", not a broken page.
      useErrorBoundary: false,
    })),
  })
  const resultByService = new Map(services.map((service, index) => [service.id, results[index]]))
  const serviceChecks = new Map(services.map((service, index) => [service.id, results[index]?.data]))
  const statuses = new Map<string, DomainDnsStatusResult>()
  const fetchingKeys = new Set<string>()
  domains.forEach((domain) => {
    const key = getDomainSelectionKey(domain)
    const domainResults = getDomainServices([domain]).map(({ id }) => resultByService.get(id))
    if (domainResults.some((result) => result?.isFetching)) fetchingKeys.add(key)
    if (domainResults.every((result) => result && !result.isLoading)) {
      statuses.set(key, getDomainDnsStatus(domain, serviceChecks))
    }
  })

  const recheck = useCallback(
    (domain: OrganizationCustomDomainResponse) =>
      Promise.all(
        getDomainServices([domain]).map((service) =>
          queryClient.refetchQueries({
            queryKey: queries.services.checkCustomDomains({ serviceId: service.id, serviceType: service.type })
              .queryKey,
            exact: true,
          })
        )
      ),
    [queryClient]
  )

  return { statuses, fetchingKeys, recheck }
}
