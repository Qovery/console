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

// The list API has no DNS status yet: derive it from the per-service DNS checks of the domains on screen.
export function useOrganizationDomainDnsStatuses(domains: OrganizationCustomDomainResponse[]) {
  const queryClient = useQueryClient()
  const services = getDomainServices(domains)
  const results = useQueries({
    queries: services.map((service) => ({
      ...queries.services.checkCustomDomains({ serviceId: service.id, serviceType: service.type }),
      retry: false,
      staleTime: DNS_CHECK_STALE_TIME,
      refetchOnWindowFocus: false,
    })),
  })
  const serviceChecks = new Map(services.map((service, index) => [service.id, results[index]?.data]))
  const checkingServiceIds = new Set(services.filter((_, index) => results[index]?.isFetching).map(({ id }) => id))
  const statuses = new Map<string, { status: DomainDnsStatus; details: string[] }>(
    domains.map((domain) => [
      getDomainSelectionKey(domain),
      getDomainDnsStatus(domain, serviceChecks, checkingServiceIds),
    ])
  )

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

  return { statuses, recheck }
}
