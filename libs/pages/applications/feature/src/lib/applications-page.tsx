import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/applications/ui'
import { useParams } from 'react-router'
import { useApplications } from '@console/domains/application'

export function ApplicationsPage() {
  useDocumentTitle('Applications - Qovery')
  const { applications, applicationsByEnv } = useApplications()
  const { environmentId } = useParams()

  return <Container applications={applicationsByEnv(environmentId || '')} />
}

export default ApplicationsPage
