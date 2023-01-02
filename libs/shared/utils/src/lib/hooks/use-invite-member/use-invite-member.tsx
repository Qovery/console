import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

//const membersApi = new MembersApi()

export function useInviteMember() {
  const [displayInvitation, setDisplayInvitation] = useState(false)
  const { search } = useLocation()

  useEffect(() => {
    // check if inviteToken query param is present in URL
    const urlParams = new URLSearchParams(search)
    const inviteToken = urlParams.get('inviteToken')

    if (inviteToken) {
      localStorage.setItem('inviteToken', inviteToken)
      const organizationId = urlParams.get('organizationId')
      if (organizationId) localStorage.setItem('inviteOrganizationId', organizationId)

      // avoid redirected conflict, we bypass the normal redirecting
      localStorage.removeItem('redirectAfterLogin')
      setDisplayInvitation(true)
    }
  }, [search])

  useEffect(() => {
    const inviteToken = localStorage.getItem('inviteToken')

    if (inviteToken) {
      // avoid redirected conflict, we bypass the normal redirecting
      localStorage.removeItem('redirectAfterLogin')
      setDisplayInvitation(true)
    } else {
      setDisplayInvitation(false)
    }
  }, [])

  const fetchInvitationDetail = () => {
    // todo
  }

  const acceptInvitation = () => {
    // todo
  }

  return { displayInvitation, fetchInvitationDetail, acceptInvitation }
}

export default useInviteMember
