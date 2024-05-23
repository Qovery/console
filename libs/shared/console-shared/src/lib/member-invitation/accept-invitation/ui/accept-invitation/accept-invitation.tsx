import { Button } from '@qovery/shared/ui'
import InviteDetailsFeature from '../../../invite-details/feature/invite-details-feature'

export interface AcceptInvitationProps {
  onSubmit: () => void
}

export function AcceptInvitation(props: AcceptInvitationProps) {
  return (
    <div className="fixed inset-0 bg-neutral-600 pt-7">
      <img
        className="mx-auto mb-12 block w-[207px] shrink-0"
        src="assets/logos/logo-white.svg"
        alt="Qovery logo white"
      />
      <div className="mx-auto max-w-[568px] rounded-xl bg-white p-6 text-center">
        <InviteDetailsFeature />
        <Button type="button" size="lg" className="mt-2 w-full justify-center" onClick={() => props.onSubmit()}>
          Accept
        </Button>
      </div>
    </div>
  )
}

export default AcceptInvitation
