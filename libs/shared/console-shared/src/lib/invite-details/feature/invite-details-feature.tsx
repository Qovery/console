import { useEffect } from 'react'
import { useInviteMember } from '@qovery/shared/utils'
import InviteDetails from '../ui/invite-details'

export function InviteDetailsFeature() {
  const { inviteDetail, fetchInvitationDetail } = useInviteMember()

  useEffect(() => {
    fetchInvitationDetail().then()
  }, [fetchInvitationDetail])

  return inviteDetail ? (
    <InviteDetails user_name={inviteDetail.inviter} organization_name={(inviteDetail as any).organization_name} />
  ) : (
    <></>
  )
}

export default InviteDetailsFeature
