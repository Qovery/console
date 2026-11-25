import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { Badge, Skeleton, Tooltip } from '@qovery/shared/ui'
import { getDomainSelectionKey } from '../utils/organization-domain-targets'
import { DOMAIN_DNS_STATUSES, type DomainDnsStatus } from '../utils/summarize-domain-dns-checks'
import { DOMAIN_DNS_STATUS_DISPLAY, OrganizationDomainStatusBadge } from './organization-domain-status-badge'
import { useOrganizationDomainDnsStatuses } from './use-organization-domain-dns-statuses'

// Same footprint as a status badge, so the cell does not move when the status arrives.
const StatusCellSkeleton = () => <Skeleton width={64} height={24} className="rounded-md" />

function StatusCellContent({ domain }: { domain: OrganizationCustomDomainResponse }) {
  const key = getDomainSelectionKey(domain)
  const { statuses, fetchingKeys } = useOrganizationDomainDnsStatuses([domain], { suspense: true })
  const result = statuses.get(key)
  if (!result || fetchingKeys.has(key)) return <StatusCellSkeleton />
  const badge = <OrganizationDomainStatusBadge status={result.status} />
  return result.details.length ? (
    <Tooltip content={result.details.join('\n')} classNameContent="max-w-80 whitespace-pre-line break-words">
      <span className="inline-flex">{badge}</span>
    </Tooltip>
  ) : (
    badge
  )
}

export function OrganizationDomainStatusCell({ domain }: { domain: OrganizationCustomDomainResponse }) {
  return (
    <Suspense fallback={<StatusCellSkeleton />}>
      <StatusCellContent domain={domain} />
    </Suspense>
  )
}

const StatusSummarySkeleton = () => (
  <div className="flex items-center gap-2" aria-hidden="true">
    <Skeleton width={64} height={24} className="rounded-full" />
    <Skeleton width={64} height={24} className="rounded-full" />
  </div>
)

interface StatusSummaryProps {
  domains: OrganizationCustomDomainResponse[]
  status: DomainDnsStatus | ''
  onStatusChange: (status: DomainDnsStatus | '') => void
}

function StatusSummaryContent({ domains, status: activeStatus, onStatusChange }: StatusSummaryProps) {
  const { statuses } = useOrganizationDomainDnsStatuses(domains, { suspense: true })
  const counts = DOMAIN_DNS_STATUSES.map(
    (status) => [status, [...statuses.values()].filter((result) => result.status === status).length] as const
  ).filter(([, count]) => count > 0)
  if (!counts.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="DNS status on this page">
      {counts.map(([status, count]) => {
        const { label, color } = DOMAIN_DNS_STATUS_DISPLAY[status]
        const active = activeStatus === status
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
            onClick={() => onStatusChange(active ? '' : status)}
          >
            <Badge
              variant="surface"
              color={color}
              radius="full"
              className={active ? 'text-ssm font-medium ring-1 ring-current' : 'text-ssm font-medium'}
            >
              {count} {label.toLowerCase()}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}

export function OrganizationDomainStatusSummary(props: StatusSummaryProps) {
  if (!props.domains.length) return null
  return (
    <Suspense fallback={<StatusSummarySkeleton />}>
      <StatusSummaryContent {...props} />
    </Suspense>
  )
}
