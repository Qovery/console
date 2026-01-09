import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AcceptInvitation, useInviteMember } from '@qovery/domains/onboarding/feature'

export const Route = createFileRoute('/_authenticated/accept-invitation/')({
  component: RouteComponent,
})

function RouteComponent() {
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
      navigate({ to: '/login' })
    }
  }, [displayInvitation, navigate])

  return <AcceptInvitation onSubmit={onSubmit} />
}
