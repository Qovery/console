import { Button } from '@qovery/shared/ui'
import InviteDetailsFeature from '../../../invite-details/feature/invite-details-feature'

export interface AcceptInvitationProps {
  onSubmit: () => void
}

export function AcceptInvitation(props: AcceptInvitationProps) {
  return (
    <div className="fixed inset-0 pt-7 bg-element-light-darker-300">
      <img
        className="w-[207px] shrink-0 block mx-auto mb-12"
        src="assets/logos/logo-white.svg"
        alt="Qovery logo white"
      />
      <div className="text-center bg-white rounded-xl p-6 max-w-[568px] mx-auto">
        <InviteDetailsFeature />
        <Button className="items-center justify-center mt-2" onClick={() => props.onSubmit()}>
          Accept
        </Button>
      </div>
    </div>
  )
}

export default AcceptInvitation
