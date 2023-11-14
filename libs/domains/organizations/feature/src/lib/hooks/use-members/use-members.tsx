import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseMembersProps {
  organizationId: string
}

export function useMembers({ organizationId }: UseMembersProps) {
  return useQuery({
    ...queries.organizations.members({ organizationId }),
  })
}

export default useMembers
