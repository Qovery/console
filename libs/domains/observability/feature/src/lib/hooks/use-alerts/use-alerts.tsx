import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'
import { isManagedAlertRule } from '../../util-alerting/alert-type-guards'

export function useAlerts({ organizationId, enabled = true }: { organizationId: string; enabled?: boolean }) {
  return useQuery({
    ...observability.alertRules({ organizationId }),
    select: (data) =>
      data
        .filter(isManagedAlertRule)
        .filter((rule) => rule.state === 'NOTIFIED')
        .sort((a, b) => new Date(b.starts_at ?? '').getTime() - new Date(a.starts_at ?? '').getTime()),
    enabled: Boolean(organizationId) || enabled,
  })
}

export default useAlerts
