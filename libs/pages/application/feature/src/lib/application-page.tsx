import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/application/ui'
import { useApplication } from '@console/domains/application'
import { useParams } from 'react-router'

export function ApplicationPage() {
  useDocumentTitle('Application - Qovery')
  const { application } = useApplication()
  const { applicationId } = useParams()

  return <Container application={application(applicationId || '')} />
}

export default ApplicationPage
