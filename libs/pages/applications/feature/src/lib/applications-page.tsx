import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/applications/ui'
import { useParams } from 'react-router'
import { selectApplicationsEntitiesByEnvId } from '@console/domains/application'
import { useSelector } from 'react-redux'
import { selectEnvironmentById, useEnvironments } from '@console/domains/projects'
import { useEffect } from 'react'

export function ApplicationsPage() {
  useDocumentTitle('Applications - Qovery')
  const { environmentId = '', projectId } = useParams()
  const { getEnvironmentsStatus } = useEnvironments()
  const applicationsByEnv = useSelector((state) => selectApplicationsEntitiesByEnvId(state, environmentId))
  const environment = useSelector((state) => selectEnvironmentById(state, environmentId))

  useEffect(() => {
    setTimeout(() => {
      projectId && getEnvironmentsStatus(projectId)
    }, 1000)
  }, [projectId, environmentId, getEnvironmentsStatus])

  return <Container applications={applicationsByEnv} environment={environment} />
}

export default ApplicationsPage
