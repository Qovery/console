import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export function useAlertReceivers({ organizationId }: { organizationId: string }) {
  return useQuery({
    ...observability.alertReceivers({ organizationId }),
  })
}

export default useAlertReceivers
