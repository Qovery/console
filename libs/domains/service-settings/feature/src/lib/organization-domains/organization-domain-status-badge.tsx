import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Badge, type BadgeProps, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type DomainDnsStatus } from '../utils/summarize-domain-dns-checks'

export const DOMAIN_DNS_STATUS_DISPLAY: Record<
  DomainDnsStatus,
  { label: string; color: NonNullable<BadgeProps['color']>; iconName: IconName }
> = {
  failing: { label: 'Failing', color: 'red', iconName: 'circle-exclamation' },
  unknown: { label: 'Unknown', color: 'neutral', iconName: 'circle-question' },
  checking: { label: 'Checking', color: 'neutral', iconName: 'clock-eight' },
  valid: { label: 'Valid', color: 'green', iconName: 'circle-check' },
}

export function OrganizationDomainStatusBadge({ status, className }: { status: DomainDnsStatus; className?: string }) {
  const { label, color, iconName } = DOMAIN_DNS_STATUS_DISPLAY[status]
  return (
    <Badge variant="surface" color={color} className={twMerge('gap-1 rounded-md font-medium', className)}>
      <Icon iconName={iconName} iconStyle="solid" className="text-[12px]" />
      {label}
    </Badge>
  )
}
