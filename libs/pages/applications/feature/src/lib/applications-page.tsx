import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useUser } from '@console/domains/user'
import { useApplications } from '@console/domains/environment'
import { useAuth, useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/applications/ui'

export function ApplicationsPage() {
  useDocumentTitle('Applications - Qovery')
  const { authLogout } = useAuth()
  const { userSignUp, getUserSignUp } = useUser()
  const { applications, getApplications } = useApplications()
  const { environmentId } = useParams()

  useEffect(() => {
    getUserSignUp()
    environmentId && getApplications(environmentId)
  }, [getUserSignUp, getApplications, environmentId])

  return <Container authLogout={authLogout} user={userSignUp} applications={applications} />
}

export default ApplicationsPage
