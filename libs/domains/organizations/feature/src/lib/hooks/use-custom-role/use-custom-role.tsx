import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCustomRoleProps {
  organizationId: string
  customRoleId: string
}

export function useCustomRole({ organizationId, customRoleId }: UseCustomRoleProps) {
  return useQuery({
    ...queries.organizations.customRole({ organizationId, customRoleId }),
  })
}

export default useCustomRole
