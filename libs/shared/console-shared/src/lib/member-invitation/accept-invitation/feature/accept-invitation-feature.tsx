import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useInviteMember } from '@qovery/shared/auth'
import { LOGIN_URL } from '@qovery/shared/routes'
import AcceptInvitation from '../ui/accept-invitation/accept-invitation'

export function AcceptInvitationFeature() {
  const { acceptInvitation, displayInvitation, checkTokenInStorage } = useInviteMember()
  const navigate = useNavigate()

  useEffect(() => {
    checkTokenInStorage()
  }, [checkTokenInStorage])

  const onSubmit = async () => {
    await acceptInvitation()
  }

  useEffect(() => {
    if (displayInvitation === false) {
      navigate({ to: LOGIN_URL })
    }
  }, [displayInvitation, navigate])

  return <AcceptInvitation onSubmit={onSubmit} />
}

export default AcceptInvitationFeature
