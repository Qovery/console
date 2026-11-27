import { useQuery } from '@tanstack/react-query'
import { type OrganizationCustomDomainFilters } from '@qovery/domains/custom-domains/data-access'
import { queries } from '@qovery/state/util-queries'
import { getDomainSelectionKey } from '../utils/organization-domain-targets'
import { type DomainDnsStatusResult, getDomainDnsStatus } from '../utils/summarize-domain-dns-checks'

const DNS_CHECK_STALE_TIME = 5 * 60_000

// One request checks the DNS of every domain on the page: pass the same filters as the domain list.
export function useOrganizationDomainDnsStatuses(filters: OrganizationCustomDomainFilters) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    ...queries.customDomains.organizationCheck(filters),
    retry: false,
    staleTime: DNS_CHECK_STALE_TIME,
    refetchOnWindowFocus: false,
    // A failed check means "unknown", not a broken page.
    useErrorBoundary: false,
  })

  const statuses = new Map(data?.map((result) => [getDomainSelectionKey(result), getDomainDnsStatus(result)]))
  const failedRequest: DomainDnsStatusResult = {
    status: 'unknown',
    details: [(error as { message?: string } | null)?.message || 'The DNS check could not run.'],
  }

  // `undefined` while the checks load. The list and the checks are two requests, so a domain the checks do not
  // know yet (for example one renamed in between) is unknown until the next check.
  const getStatus = (domain: { environment_id: string; domain: string }): DomainDnsStatusResult | undefined => {
    if (isLoading) return undefined
    if (isError) return failedRequest
    return statuses.get(getDomainSelectionKey(domain)) ?? getDomainDnsStatus(undefined)
  }

  return { getStatus, isChecking: isFetching, recheck: refetch }
}
