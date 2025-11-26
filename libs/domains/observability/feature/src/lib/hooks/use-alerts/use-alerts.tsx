import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export function useAlerts({ organizationId }: { organizationId: string }) {
  return useQuery({
    ...observability.alertRules({ organizationId }),
    select: (data) => data.filter((rule) => rule.state === 'NOTIFIED'),
    enabled: Boolean(organizationId),
  })
}

export default useAlerts
