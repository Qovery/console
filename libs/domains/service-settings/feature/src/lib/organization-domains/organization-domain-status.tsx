import { Badge, Skeleton, Tooltip } from '@qovery/shared/ui'
import {
  DOMAIN_DNS_STATUSES,
  type DomainDnsStatus,
  type DomainDnsStatusResult,
} from '../utils/summarize-domain-dns-checks'
import { DOMAIN_DNS_STATUS_DISPLAY, OrganizationDomainStatusBadge } from './organization-domain-status-badge'

// Same footprint as a status badge, so the cell does not move when the status arrives.
const StatusCellSkeleton = () => <Skeleton width={64} height={24} className="rounded-md" />

// `result` is `undefined` while the DNS checks load.
export function OrganizationDomainStatusCell({
  result,
  checking = false,
}: {
  result?: DomainDnsStatusResult
  checking?: boolean
}) {
  if (!result || checking) return <StatusCellSkeleton />
  const badge = <OrganizationDomainStatusBadge status={result.status} />
  return result.details.length ? (
    <Tooltip content={result.details.join('\n')} classNameContent="max-w-80 whitespace-pre-line break-words">
      <span className="inline-flex">{badge}</span>
    </Tooltip>
  ) : (
    badge
  )
}

const StatusSummarySkeleton = () => (
  <div className="flex items-center gap-2" aria-hidden="true">
    <Skeleton width={64} height={24} className="rounded-full" />
    <Skeleton width={64} height={24} className="rounded-full" />
  </div>
)

interface StatusSummaryProps {
  // `undefined` while the DNS checks load.
  counts?: Map<DomainDnsStatus, number>
  status: DomainDnsStatus | ''
  onStatusChange: (status: DomainDnsStatus | '') => void
}

export function OrganizationDomainStatusSummary({ counts, status: activeStatus, onStatusChange }: StatusSummaryProps) {
  if (!counts) return <StatusSummarySkeleton />
  const entries = DOMAIN_DNS_STATUSES.flatMap((status) => {
    const count = counts.get(status) ?? 0
    return count > 0 ? [[status, count] as const] : []
  })
  if (!entries.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="DNS status on this page">
      {entries.map(([status, count]) => {
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
