import { applications, useApplications } from '@console/domains/environment'
import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/applications/ui'
import { useParams } from 'react-router'

export function ApplicationsPage() {
  useDocumentTitle('Applications - Qovery')
  const { applications, applicationsByEnv } = useApplications()
  const { environmentId } = useParams()

  return <Container applications={applicationsByEnv(environmentId || '')} />
}

export default ApplicationsPage
