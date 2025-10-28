import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export function useAlertRules({ organizationId, serviceId }: { organizationId: string; serviceId: string }) {
  return useQuery({
    ...observability.alertRules({ organizationId }),
    select: (data) => {
      console.log(data)
      console.log(serviceId)
      return data.filter((rule) => rule.target.target_id === serviceId)
    },
    enabled: Boolean(organizationId),
  })
}

export default useAlertRules
