import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseMembersProps {
  organizationId: string
  suspense?: boolean
}

export function useMembers({ organizationId, suspense = false }: UseMembersProps) {
  return useQuery({
    ...queries.organizations.members({ organizationId }),
    meta: {
      notifyOnError: true,
    },
    suspense,
  })
}

export default useMembers
