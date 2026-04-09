import { useAuth0 } from '@auth0/auth0-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { type InviteMember } from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { useAcceptInviteMember, useMemberInvitation, useOrganizations } from '@qovery/domains/organizations/feature'
import { useAuth } from '@qovery/shared/auth'
import { ACCEPT_INVITATION_URL, LOGIN_URL, LOGOUT_URL } from '@qovery/shared/routes'
import { useLocalStorage } from '@qovery/shared/util-hooks'

function getInviteParams(search = '') {
  const urlParams = new URLSearchParams(search)

  return {
    inviteToken: urlParams.get('inviteToken') || undefined,
    organizationId: urlParams.get('organization') || undefined,
  }
}

export function useInviteMember() {
  const [displayInvitation, setDisplayInvitation] = useState<boolean | undefined>(undefined)
  const [organizationId, setOrganizationId] = useState<string>()
  const [inviteId, setInviteId] = useState<string>()
  const [inviteDetail, setInviteDetail] = useState<InviteMember | undefined>()
  const [isAcceptingInvitation, setIsAcceptingInvitation] = useState(false)
  const [storedInviteId, setStoredInviteId] = useLocalStorage<string | undefined>('inviteToken', undefined)
  const [storedOrganizationId, setStoredOrganizationId] = useLocalStorage<string | undefined>(
    'inviteOrganizationId',
    undefined
  )
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth0()
  const { getAccessTokenSilently } = useAuth()
  const { mutateAsync: mutateAcceptInviteMember } = useAcceptInviteMember()
  const { refetch: refetchMemberInvitation } = useMemberInvitation({ organizationId, inviteId, enabled: false })
  const { refetch: refetchOrganizations } = useOrganizations({
    enabled: isAuthenticated,
  })

  const initializeInvitation = useCallback(
    (search = '') => {
      const { inviteToken: searchInviteToken, organizationId: searchOrganizationId } = getInviteParams(search)

      if (searchInviteToken) {
        setStoredInviteId(searchInviteToken)
      }

      if (searchOrganizationId) {
        setStoredOrganizationId(searchOrganizationId)
      }

      const nextInviteId = searchInviteToken ?? storedInviteId
      const nextOrganizationId = searchOrganizationId ?? storedOrganizationId
      const hasInvitation = Boolean(nextInviteId && nextOrganizationId)

      if (searchInviteToken || hasInvitation) {
        // avoid redirected conflict, we bypass the normal redirecting
        localStorage.removeItem('redirectLoginUri')
      }

      setInviteId(nextInviteId)
      setOrganizationId(nextOrganizationId)
      setDisplayInvitation(hasInvitation)

      return hasInvitation
    },
    [setStoredInviteId, setStoredOrganizationId, storedInviteId, storedOrganizationId]
  )

  const checkTokenInStorage = useCallback(() => initializeInvitation(), [initializeInvitation])

  const onSearchUpdate = useCallback(() => initializeInvitation(window.location.search), [initializeInvitation])

  const redirectToAcceptPageGuard = useCallback(() => {
    if (displayInvitation && pathname.indexOf(ACCEPT_INVITATION_URL) === -1 && pathname.indexOf(LOGIN_URL) === -1) {
      navigate({ to: ACCEPT_INVITATION_URL })
    }
  }, [pathname, displayInvitation, navigate])

  const cleanInvitation = () => {
    setStoredOrganizationId(undefined)
    setStoredInviteId(undefined)
    setInviteId(undefined)
    setOrganizationId(undefined)
  }

  const acceptInvitation = async () => {
    if (organizationId && inviteId) {
      setIsAcceptingInvitation(true)
      try {
        await mutateAcceptInviteMember({ organizationId, inviteId })
        cleanInvitation()

        await getAccessTokenSilently({ cacheMode: 'off' })
        await refetchOrganizations()
        window.location.assign(`/organization/${organizationId}`)
      } catch (e) {
        console.error(e)
        setIsAcceptingInvitation(false)
        setDisplayInvitation(false)
        cleanInvitation()
        setTimeout(() => {
          window.location.assign(`/`)
        })

        navigate({ to: LOGOUT_URL })
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
    isAcceptingInvitation,
    cleanInvitation,
    inviteDetail,
    initializeInvitation,
    redirectToAcceptPageGuard,
    onSearchUpdate,
    checkTokenInStorage,
  }
}
