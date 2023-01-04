import { SerializedError } from '@reduxjs/toolkit'
import { InviteMember, MembersApi } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchOrganization } from '@qovery/domains/organization'
import { useAuth } from '@qovery/shared/auth'
import { ACCEPT_INVITATION_URL, LOGIN_URL } from '@qovery/shared/router'
import { toastError } from '@qovery/shared/toast'
import { AppDispatch } from '@qovery/store'

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
            console.log('clean invitation')
            cleanInvitation()
            console.log('get new token')
            await getAccessTokenSilently({})
            console.log('get list of organisations')
            dispatch(fetchOrganization())
              .unwrap()
              .then((value) => {
                console.log(value)
                console.log('redirect')
                //window.location.replace(`/organization/${organizationId}`)
              })
          })
      } catch (e) {
        setDisplayInvitation(false)
        toastError(e as SerializedError, 'Invitation Member', 'The invitation can not be accepted')
        cleanInvitation()
        setTimeout(() => {
          navigate(`/`)
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

  return { displayInvitation, fetchInvitationDetail, acceptInvitation, inviteDetail }
}

export default useInviteMember

// https://console.qovery.com/login?inviteToken=c14cbd1f-7ee6-4c57-92c4-c3e48d1f38f0&organization=3d542888-3d2c-474a-b1ad-712556db66da
