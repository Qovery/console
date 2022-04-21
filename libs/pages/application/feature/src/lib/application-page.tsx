import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/application/ui'
import { useApplication } from '@console/domains/application'

export function ApplicationPage() {
  useDocumentTitle('Application - Qovery')
  const { application } = useApplication()

  return <Container application={application} />
}

export default ApplicationPage
