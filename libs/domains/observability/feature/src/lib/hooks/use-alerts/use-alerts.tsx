import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export function useAlerts({ organizationId }: { organizationId: string }) {
  return useQuery({
    ...observability.alertRules({ organizationId }),
    select: (data) =>
      data
        .filter((rule) => rule.state === 'NOTIFIED')
        .sort((a, b) => new Date(b.starts_at ?? '').getTime() - new Date(a.starts_at ?? '').getTime()),
    enabled: Boolean(organizationId),
  })
}

export default useAlerts
