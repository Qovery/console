import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseKedaTriggerAuthenticationProps {
  organizationId: string
  triggerAuthenticationId: string
  enabled?: boolean
}

export function useKedaTriggerAuthentication({
  organizationId,
  triggerAuthenticationId,
  enabled = true,
}: UseKedaTriggerAuthenticationProps) {
  return useQuery({
    ...queries.organizations.kedaTriggerAuthentication({ organizationId, triggerAuthenticationId }),
    enabled,
  })
}

export default useKedaTriggerAuthentication
