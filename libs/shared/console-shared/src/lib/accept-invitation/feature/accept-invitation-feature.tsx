import { useAuth } from '@qovery/shared/auth'
import { useInviteMember } from '@qovery/shared/utils'
import AcceptInvitation from '../ui/accept-invitation/accept-invitation'

export function AcceptInvitationFeature() {
  const { acceptInvitation } = useInviteMember()
  const { getAccessTokenSilently } = useAuth()

  const onSubmit = async () => {
    await acceptInvitation()
  }

  const onRefresh = async (cache = false) => {
    const token = await getAccessTokenSilently({ ignoreCache: cache })
    console.log(token)
  }

  return <AcceptInvitation onSubmit={onSubmit} refresh={onRefresh} />
}

export default AcceptInvitationFeature
