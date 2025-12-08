import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'
import { isManagedAlertRule } from '../../util-alerting/alert-type-guards'

export function useAlertRules({ organizationId, serviceId }: { organizationId: string; serviceId?: string }) {
  return useQuery({
    ...observability.alertRules({ organizationId }),
    select: (data) => {
      // Filter out ghost alerts - only return managed alerts
      const managedAlerts = data.filter(isManagedAlertRule)
      return serviceId ? managedAlerts.filter((rule) => rule.target.target_id === serviceId) : managedAlerts
    },
    enabled: Boolean(organizationId),
  })
}

export default useAlertRules
