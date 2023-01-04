import { Button } from '@qovery/shared/ui'
import InviteDetailsFeature from '../../../invite-details/feature/invite-details-feature'

export interface AcceptInvitationProps {
  onSubmit: () => void
  refresh: (cache: boolean) => void
}

export function AcceptInvitation(props: AcceptInvitationProps) {
  return (
    <div className="text-center">
      <InviteDetailsFeature />
      <Button className="items-center justify-center mt-2" onClick={() => props.onSubmit()}>
        Accept
      </Button>
      <Button className="items-center justify-center mt-2" onClick={() => props.refresh(false)}>
        Refresh token silently
      </Button>
      <Button className="items-center justify-center mt-2" onClick={() => props.refresh(true)}>
        Refresh token silently no cache
      </Button>
    </div>
  )
}

export default AcceptInvitation
