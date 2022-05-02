import { Container } from '@console/pages/environments/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { useEnviroments } from '@console/domains/projects'
import { useEffect } from 'react'
import { useParams } from 'react-router'

export function EnvironmentsPage() {
  useDocumentTitle('Environments - Qovery')
  const { environments, getEnvironmentsStatus } = useEnviroments()
  const { projectId } = useParams()

  useEffect(() => {
    setTimeout(() => {
      projectId && getEnvironmentsStatus(projectId)
    }, 1000)
  }, [projectId, getEnvironmentsStatus])

  return <Container environments={environments} />
}

export default EnvironmentsPage
