import { useEffect } from 'react'
import { Button, LogoBrandedIcon } from '@qovery/shared/ui'
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
    <p className="text-xl font-bold text-neutral">
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
    <div className="bg-neutral fixed inset-0 pt-7">
      <LogoBrandedIcon className="mx-auto mb-12 block w-[207px] shrink-0 text-neutral" />
      <div className="mx-auto max-w-[568px] rounded-xl bg-surface-neutral-component p-6 text-center">
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
