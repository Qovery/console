import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { AcceptInvitation, useInviteMember } from '@qovery/domains/onboarding/feature'

const acceptInvitationSearchSchema = z.object({
  inviteToken: z.string().optional(),
  organization: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/accept-invitation/')({
  validateSearch: acceptInvitationSearchSchema,
  component: AcceptInvitationRouteComponent,
})

export function AcceptInvitationRouteComponent() {
  const {
    acceptInvitation,
    displayInvitation,
    fetchInvitationDetail,
    initializeInvitation,
    inviteDetail,
    isAcceptingInvitation,
  } = useInviteMember()
  const navigate = useNavigate()
  const search = Route.useSearch()

  const inviteSearch = useMemo(() => {
    const searchParams = new URLSearchParams()

    if (search.inviteToken) {
      searchParams.set('inviteToken', search.inviteToken)
    }

    if (search.organization) {
      searchParams.set('organization', search.organization)
    }

    const searchString = searchParams.toString()
    return searchString ? `?${searchString}` : ''
  }, [search.inviteToken, search.organization])

  useEffect(() => {
    initializeInvitation(inviteSearch)
  }, [initializeInvitation, inviteSearch])

  const onSubmit = async () => {
    await acceptInvitation()
  }

  useEffect(() => {
    if (displayInvitation) {
      fetchInvitationDetail().then()
    }
  }, [displayInvitation, fetchInvitationDetail])

  useEffect(() => {
    if (displayInvitation === false) {
      navigate({ to: '/login' })
    }
  }, [displayInvitation, navigate])

  return <AcceptInvitation inviteDetail={inviteDetail} loading={isAcceptingInvitation} onSubmit={onSubmit} />
}
