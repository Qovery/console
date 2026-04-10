import { type InviteMember } from 'qovery-typescript-axios'
import { Button, LogoBrandedIcon } from '@qovery/shared/ui'

export interface AcceptInvitationProps {
  inviteDetail?: InviteMember
  loading?: boolean
  onSubmit: () => void
}

interface InviteDetailsProps {
  user_name?: string
  organization_name?: string
}

function InviteDetails({ user_name = '', organization_name = '' }: InviteDetailsProps) {
  return (
    <div className="text-xl font-bold text-neutral">
      <span>{user_name} has invited you to join: </span>
      <br />
      <strong className="text-brand">{organization_name}</strong>
    </div>
  )
}

export function AcceptInvitation({ inviteDetail, loading = false, onSubmit }: AcceptInvitationProps) {
  return (
    <div className="bg-neutral fixed inset-0 px-8">
      <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral bg-surface-neutral-subtle p-6 text-center shadow-lg md:max-w-[568px]">
        <LogoBrandedIcon className="mx-auto block w-[207px] shrink-0 text-neutral" />
        {inviteDetail && (
          <InviteDetails user_name={inviteDetail.inviter} organization_name={inviteDetail.organization_name} />
        )}
        <Button type="button" size="lg" className="mt-10 w-full justify-center" loading={loading} onClick={onSubmit}>
          Accept invitation
        </Button>
      </div>
    </div>
  )
}

export default AcceptInvitation
