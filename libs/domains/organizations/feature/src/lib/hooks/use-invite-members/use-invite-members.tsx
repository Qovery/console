import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseInviteMembersProps {
  organizationId: string
}

export function useInviteMembers({ organizationId }: UseInviteMembersProps) {
  return useQuery({
    ...queries.organizations.inviteMembers({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => a.email.localeCompare(b.email))
    },
  })
}

export default useInviteMembers
