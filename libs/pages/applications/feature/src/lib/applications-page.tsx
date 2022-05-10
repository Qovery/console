import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/applications/ui'
import { useParams } from 'react-router'
import { selectApplicationsEntitiesByEnvId } from '@console/domains/application'
import { useSelector } from 'react-redux'

export function ApplicationsPage() {
  useDocumentTitle('Applications - Qovery')
  const { environmentId = '' } = useParams()
  const applicationsByEnv = useSelector((state) => selectApplicationsEntitiesByEnvId(state, environmentId))

  return <Container applications={applicationsByEnv} />
}

export default ApplicationsPage
