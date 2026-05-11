import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseInviteMembersProps {
  organizationId: string
  suspense?: boolean
}

export function useInviteMembers({ organizationId, suspense = false }: UseInviteMembersProps) {
  return useQuery({
    ...queries.organizations.inviteMembers({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.email.localeCompare(b.email))
    },
    suspense,
  })
}

export default useInviteMembers
