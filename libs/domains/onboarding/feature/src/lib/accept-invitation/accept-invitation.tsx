import { useEffect } from 'react'
import { Button } from '@qovery/shared/ui'
import { useInviteMember } from '../hooks/use-invite-member/use-invite-member'

export interface AcceptInvitationProps {
  onSubmit: () => void
}
interface InviteDetailsProps {
  user_name?: string
  organization_name?: string
}

function InviteDetails(props: InviteDetailsProps) {
  const { user_name = '', organization_name = '' } = props

  return (
    <p className="text-xl font-bold text-neutral-400">
      {user_name} has invited you to join
      <br />
      <strong className="text-2xl">{organization_name}</strong>
    </p>
  )
}

export function AcceptInvitation(props: AcceptInvitationProps) {
  const { inviteDetail, fetchInvitationDetail, checkTokenInStorage } = useInviteMember()

  useEffect(() => {
    checkTokenInStorage()
  }, [checkTokenInStorage])

  useEffect(() => {
    fetchInvitationDetail().then()
  }, [fetchInvitationDetail])

  return (
    <div className="fixed inset-0 bg-neutral-600 pt-7">
      <img
        className="mx-auto mb-12 block w-[207px] shrink-0"
        src="assets/logos/logo-white.svg"
        alt="Qovery logo white"
      />
      <div className="mx-auto max-w-[568px] rounded-xl bg-white p-6 text-center">
        {inviteDetail && (
          <InviteDetails user_name={inviteDetail.inviter} organization_name={inviteDetail.organization_name} />
        )}
        <Button type="button" size="lg" className="mt-2 w-full justify-center" onClick={() => props.onSubmit()}>
          Accept
        </Button>
      </div>
    </div>
  )
}

export default AcceptInvitation
