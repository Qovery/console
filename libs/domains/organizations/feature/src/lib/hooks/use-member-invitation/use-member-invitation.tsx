import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseMemberInvitationProps {
  organizationId?: string
  inviteId?: string
  enabled?: boolean
}

export function useMemberInvitation({ organizationId, inviteId, enabled = true }: UseMemberInvitationProps) {
  return useQuery({
    ...queries.organizations.memberInvitation({ organizationId: organizationId!, inviteId: inviteId! }),
    enabled: !!organizationId && !!inviteId && enabled,
  })
}

export default useMemberInvitation
