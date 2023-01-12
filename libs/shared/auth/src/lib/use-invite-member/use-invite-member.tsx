import { InviteMember } from 'qovery-typescript-axios'
import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchOrganization } from '@qovery/domains/organization'
import { acceptMembershipInvitation, fetchMemberInvitation } from '@qovery/domains/user'
import { ACCEPT_INVITATION_URL, LOGIN_URL, LOGOUT_URL } from '@qovery/shared/routes'
import { AppDispatch } from '@qovery/store'
import useAuth from '../use-auth/use-auth'

export function useInviteMember() {
  const [displayInvitation, setDisplayInvitation] = useState<boolean | undefined>(undefined)
  const [organizationId, setOrganizationId] = useState<string>()
  const [inviteId, setInviteId] = useState<string>()
  const [inviteDetail, setInviteDetail] = useState<InviteMember | undefined>()
  const { search, pathname } = useLocation()
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

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
    if (organizationId && inviteId)
      dispatch(acceptMembershipInvitation({ organizationId, inviteId }))
        .unwrap()
        .then(
          async () => {
            cleanInvitation()
            try {
              await getAccessTokenSilently({ ignoreCache: true })
              dispatch(fetchOrganization())
                .unwrap()
                .then((value) => {
                  window.location.assign(`/organization/${organizationId}`)
                })
            } catch (e) {
              navigate(LOGOUT_URL)
            }
          },
          () => {
            setDisplayInvitation(false)
            cleanInvitation()
            setTimeout(() => {
              window.location.assign(`/`)
            })
          }
        )
  }

  const fetchInvitationDetail = useCallback(async () => {
    if (organizationId && inviteId) {
      dispatch(fetchMemberInvitation({ organizationId, inviteId }))
        .unwrap()
        .then(
          (invitationDetails) => {
            if (invitationDetails) setInviteDetail(invitationDetails.data)
          },
          () => {
            setDisplayInvitation(false)
            cleanInvitation()
            setTimeout(() => {
              window.location.assign(`/`)
            })
          }
        )
    }
  }, [organizationId, inviteId, dispatch])

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
