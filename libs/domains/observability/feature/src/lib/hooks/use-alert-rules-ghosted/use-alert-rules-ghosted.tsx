import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'
import { isGhostAlertRule } from '../../util-alerting/alert-type-guards'

export function useAlertRulesGhosted({ organizationId, serviceId }: { organizationId: string; serviceId?: string }) {
  return useQuery({
    ...observability.alertRules({ organizationId }),
    select: (data) => {
      const ghostAlerts = data.filter(isGhostAlertRule)
      return serviceId ? ghostAlerts.filter((rule) => rule.target?.target_id === serviceId) : ghostAlerts
    },
    enabled: Boolean(organizationId),
  })
}

export default useAlertRulesGhosted
