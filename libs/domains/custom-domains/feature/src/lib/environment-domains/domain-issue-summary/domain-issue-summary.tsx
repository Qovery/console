import { Badge, Button, Callout, Icon } from '@qovery/shared/ui'
import { DOMAIN_ISSUES, type DomainIssue } from '../domain-routing'

export const DOMAIN_ISSUE_LABELS: Record<DomainIssue, string> = {
  conflict: 'Path conflict',
  'no-route': 'No route (404)',
  'stopped-target': 'Stopped service (503)',
  'tls-pending': 'TLS pending',
}

export const DOMAIN_ISSUE_COLORS: Record<DomainIssue, 'red' | 'yellow' | 'sky'> = {
  conflict: 'red',
  'no-route': 'red',
  'stopped-target': 'yellow',
  'tls-pending': 'sky',
}

// What each issue means for traffic.
const IMPACTS: Record<DomainIssue, string> = {
  conflict: 'deployment blocked until one route is changed',
  'no-route': 'every request returns 404',
  'stopped-target': 'the paths of a stopped service return 503',
  'tls-pending': 'HTTPS not ready yet, check the CNAME',
}

export interface DomainIssueSummaryProps {
  total: number
  // Hosts affected by each issue.
  hostsByIssue: Record<DomainIssue, string[]>
  onShowIssue: (issue: DomainIssue) => void
}

export function DomainIssueSummary({ total, hostsByIssue, onShowIssue }: DomainIssueSummaryProps) {
  const present = DOMAIN_ISSUES.filter((issue) => hostsByIssue[issue].length > 0)
  if (total === 0) return null

  if (present.length === 0) {
    return (
      <Callout.Root color="green">
        <Callout.Icon>
          <Icon iconName="circle-check" iconStyle="regular" />
        </Callout.Icon>
        <Callout.TextHeading>
          All {total} domain{total === 1 ? '' : 's'} serve traffic normally.
        </Callout.TextHeading>
      </Callout.Root>
    )
  }

  const affected = new Set(present.flatMap((issue) => hostsByIssue[issue])).size
  const isBlocking = present.some((issue) => DOMAIN_ISSUE_COLORS[issue] === 'red')

  return (
    <Callout.Root color={isBlocking ? 'red' : 'yellow'}>
      <Callout.Icon>
        <Icon iconName="triangle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>
          {affected} of {total} domains need attention
        </Callout.TextHeading>
        <ul className="mt-2 flex flex-col gap-1">
          {present.map((issue) => {
            const hosts = hostsByIssue[issue]
            return (
              <li key={issue} className="flex flex-wrap items-center gap-x-2 text-sm">
                <Badge variant="surface" color={DOMAIN_ISSUE_COLORS[issue]} size="sm">
                  {hosts.length} × {DOMAIN_ISSUE_LABELS[issue]}
                </Badge>
                <span className="text-neutral-subtle">{IMPACTS[issue]}</span>
                <span className="text-xs text-neutral-subtle">
                  {hosts.slice(0, 3).join(', ')}
                  {hosts.length > 3 && ` +${hosts.length - 3}`}
                </span>
                <Button size="xs" variant="plain" color="neutral" onClick={() => onShowIssue(issue)}>
                  Show
                </Button>
              </li>
            )
          })}
        </ul>
      </Callout.Text>
    </Callout.Root>
  )
}

export default DomainIssueSummary
