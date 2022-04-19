import { useEffect } from 'react'
import { useUser } from '@console/domains/user'
import { Container } from '@console/pages/environments/ui'
import { useAuth, useDocumentTitle } from '@console/shared/utils'
import { useEnviroments } from '@console/domains/projects'
import { useParams } from 'react-router'

export function EnvironmentsPage() {
  useDocumentTitle('Environments - Qovery')
  const { authLogout } = useAuth()
  const { userSignUp, getUserSignUp } = useUser()
  const { environments, getEnvironments } = useEnviroments()
  const { projectId } = useParams()

  useEffect(() => {
    getUserSignUp()
    projectId && getEnvironments(projectId)
  }, [getUserSignUp, getEnvironments, projectId])

  return <Container authLogout={authLogout} user={userSignUp} environments={environments} />
}

export default EnvironmentsPage
