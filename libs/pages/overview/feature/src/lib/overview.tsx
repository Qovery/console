import { useEffect } from 'react'
import { useOrganization } from '@console/domains/organization'
import { Overview } from '@console/pages/overview/ui'
import { useAuth, useDocumentTitle } from '@console/shared/utils'
import { useUser } from '@console/domains/user'

export function OverviewPage() {
  useDocumentTitle('Overview - Qovery')
  const { organization, getOrganization } = useOrganization()
  const { authLogout } = useAuth()
  const { userSignUp, getUserSignUp } = useUser()

  useEffect(() => {
    getOrganization()
    getUserSignUp()
  }, [getOrganization, getUserSignUp])

  return <Overview organization={organization} authLogout={authLogout} user={userSignUp} />
}

export default OverviewPage
