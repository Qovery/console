import { SerializedError } from '@reduxjs/toolkit'
import { InviteMember, MembersApi } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchOrganization } from '@qovery/domains/organization'
import { ACCEPT_INVITATION_URL, LOGIN_URL, LOGOUT_URL } from '@qovery/shared/routes'
import { toastError } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'
import useAuth from '../use-auth/use-auth'

const membersApi = new MembersApi()

export function useInviteMember() {
  const [displayInvitation, setDisplayInvitation] = useState(false)
  const [organizationId, setOrganizationId] = useState<string>()
  const [inviteId, setInviteId] = useState<string>()
  const [inviteDetail, setInviteDetail] = useState<InviteMember | undefined>()
  const { search, pathname } = useLocation()
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    if (displayInvitation) {
      if (pathname.indexOf(ACCEPT_INVITATION_URL) === -1 && pathname.indexOf(LOGIN_URL) === -1) {
        navigate(ACCEPT_INVITATION_URL)
      }
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
      try {
        membersApi
          .postAcceptInviteMember(organizationId, inviteId, {
            data: {},
          })
          .then(async () => {
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
          })
      } catch (e) {
        setDisplayInvitation(false)
        toastError(e as SerializedError, 'Invitation Member', 'The invitation can not be accepted')
        cleanInvitation()
        setTimeout(() => {
          window.location.assign(`/`)
        })
      }
  }

  const fetchInvitationDetail = useCallback(async () => {
    if (organizationId && inviteId) {
      try {
        const invitationDetails = await membersApi.getMemberInvitation(organizationId, inviteId)
        setInviteDetail(invitationDetails.data)
      } catch (e) {
        setDisplayInvitation(false)
        cleanInvitation()
        toastError(e as SerializedError, 'Invitation Member', 'This member invitation is not correct')
      }
    }
  }, [organizationId, inviteId])

  return { displayInvitation, fetchInvitationDetail, acceptInvitation, cleanInvitation, inviteDetail }
}
