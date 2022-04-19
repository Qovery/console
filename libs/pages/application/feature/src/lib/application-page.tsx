import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useUser } from '@console/domains/user'
import { useAuth, useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/application/ui'
import { useApplication } from '@console/domains/application'

export function ApplicationPage() {
  useDocumentTitle('Application - Qovery')
  const { authLogout } = useAuth()
  const { userSignUp, getUserSignUp } = useUser()
  const { application, getApplication } = useApplication()
  const { applicationId } = useParams()

  useEffect(() => {
    getUserSignUp()
    applicationId && getApplication(applicationId)
  }, [getUserSignUp, applicationId, getApplication])

  return <Container authLogout={authLogout} user={userSignUp} application={application} />
}

export default ApplicationPage
