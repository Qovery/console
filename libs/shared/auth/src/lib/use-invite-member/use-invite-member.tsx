import { useAuth0 } from '@auth0/auth0-react'
import { type InviteMember } from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAcceptInviteMember, useMemberInvitation, useOrganizations } from '@qovery/domains/organizations/feature'
import { ACCEPT_INVITATION_URL, LOGIN_URL, LOGOUT_URL } from '@qovery/shared/routes'
import useAuth from '../use-auth/use-auth'

export function useInviteMember() {
  const [displayInvitation, setDisplayInvitation] = useState<boolean | undefined>(undefined)
  const [organizationId, setOrganizationId] = useState<string>()
  const [inviteId, setInviteId] = useState<string>()
  const [inviteDetail, setInviteDetail] = useState<InviteMember | undefined>()
  const { search, pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth0()
  const { getAccessTokenSilently } = useAuth()
  const { mutateAsync: mutateAcceptInviteMember } = useAcceptInviteMember()
  const { refetch: refetchMemberInvitation } = useMemberInvitation({ organizationId, inviteId, enabled: false })
  const { refetch: refetchOrganizations } = useOrganizations({
    enabled: isAuthenticated,
  })

  const checkTokenInStorage = useCallback(() => {
    const inviteToken = localStorage.getItem('inviteToken')

    if (inviteToken) {
      // avoid redirected conflict, we bypass the normal redirecting
      localStorage.removeItem('redirectLoginUri')
      setInviteId(inviteToken)
      setOrganizationId(localStorage.getItem('inviteOrganizationId') || '')
      setDisplayInvitation(true)
    } else {
      setDisplayInvitation(false)
    }
  }, [])

  const onSearchUpdate = useCallback(() => {
    // check if inviteToken query param is present in URL
    const urlParams = new URLSearchParams(search)
    const inviteToken = urlParams.get('inviteToken')

    if (inviteToken) {
      localStorage.setItem('inviteToken', inviteToken)
      setInviteId(inviteToken)

      const organizationId = urlParams.get('organization')
      if (organizationId) {
        localStorage.setItem('inviteOrganizationId', organizationId)
        setOrganizationId(organizationId)
      }

      // avoid redirected conflict, we bypass the normal redirecting
      localStorage.removeItem('redirectLoginUri')
      setDisplayInvitation(true)
    }
  }, [search, setOrganizationId, setInviteId, setDisplayInvitation])

  const redirectToAcceptPageGuard = useCallback(() => {
    if (displayInvitation && pathname.indexOf(ACCEPT_INVITATION_URL) === -1 && pathname.indexOf(LOGIN_URL) === -1) {
      navigate(ACCEPT_INVITATION_URL)
    }
  }, [pathname, displayInvitation, navigate])

  const cleanInvitation = () => {
    localStorage.removeItem('inviteOrganizationId')
    localStorage.removeItem('inviteToken')
    setInviteId(undefined)
    setOrganizationId(undefined)
  }

  const acceptInvitation = async () => {
    if (organizationId && inviteId) {
      try {
        await mutateAcceptInviteMember({ organizationId, inviteId })
        cleanInvitation()

        await getAccessTokenSilently({ cacheMode: 'off' })
        await refetchOrganizations()
        window.location.assign(`/organization/${organizationId}`)
      } catch (e) {
        console.error(e)
        setDisplayInvitation(false)
        cleanInvitation()
        setTimeout(() => {
          window.location.assign(`/`)
        })

        navigate(LOGOUT_URL)
      }
    }
  }

  const fetchInvitationDetail = useCallback(async () => {
    if (organizationId && inviteId) {
      try {
        const invitationDetails = await refetchMemberInvitation()
        setInviteDetail(invitationDetails.data)
      } catch (e) {
        console.error(e)
        setDisplayInvitation(false)
        cleanInvitation()
        setTimeout(() => {
          window.location.assign(`/`)
        })
      }
    }
  }, [organizationId, inviteId, refetchMemberInvitation])

  return {
    displayInvitation,
    fetchInvitationDetail,
    acceptInvitation,
    cleanInvitation,
    inviteDetail,
    redirectToAcceptPageGuard,
    onSearchUpdate,
    checkTokenInStorage,
  }
}
