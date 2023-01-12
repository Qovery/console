import { useEffect } from 'react'
import { useInviteMember } from '@qovery/shared/auth'
import InviteDetails from '../ui/invite-details'

export function InviteDetailsFeature() {
  const { inviteDetail, fetchInvitationDetail, checkTokenInStorage } = useInviteMember()

  useEffect(() => {
    checkTokenInStorage()
  }, [checkTokenInStorage])

  useEffect(() => {
    fetchInvitationDetail().then()
  }, [fetchInvitationDetail])

  if (!inviteDetail) return null

  return (
    inviteDetail && (
      <InviteDetails user_name={inviteDetail.inviter} organization_name={inviteDetail.organization_name} />
    )
  )
}

export default InviteDetailsFeature
