import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseKedaTriggerAuthenticationsProps {
  organizationId: string
  enabled?: boolean
}

export function useKedaTriggerAuthentications({ organizationId, enabled = true }: UseKedaTriggerAuthenticationsProps) {
  return useQuery({
    ...queries.organizations.kedaTriggerAuthentications({ organizationId }),
    enabled,
  })
}

export default useKedaTriggerAuthentications
