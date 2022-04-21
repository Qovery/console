import { useApplications } from '@console/domains/environment'
import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/applications/ui'

export function ApplicationsPage() {
  useDocumentTitle('Applications - Qovery')
  const { applications } = useApplications()

  return <Container applications={applications} />
}

export default ApplicationsPage
