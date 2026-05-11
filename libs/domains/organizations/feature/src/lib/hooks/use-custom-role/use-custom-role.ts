import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseCustomRoleProps {
  organizationId: string
  customRoleId: string
  suspense?: boolean
}

export function useCustomRole({ organizationId, customRoleId, suspense = false }: UseCustomRoleProps) {
  return useQuery({
    ...queries.organizations.customRole({ organizationId, customRoleId }),
    suspense,
  })
}

export default useCustomRole
