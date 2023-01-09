import { useInviteMember } from '@qovery/shared/auth'
import AcceptInvitation from '../ui/accept-invitation/accept-invitation'

export function AcceptInvitationFeature() {
  const { acceptInvitation } = useInviteMember()

  const onSubmit = async () => {
    await acceptInvitation()
  }

  return <AcceptInvitation onSubmit={onSubmit} />
}

export default AcceptInvitationFeature
