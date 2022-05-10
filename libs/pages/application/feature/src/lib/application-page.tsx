import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/application/ui'
import { selectApplicationById, useApplication } from '@console/domains/application'
import { useParams } from 'react-router'
import { Application } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'

export function ApplicationPage() {
  useDocumentTitle('Application - Qovery')
  const { applicationId = '' } = useParams()
  const application = useSelector((state) => selectApplicationById(state, applicationId))

  return <Container application={application} />
}

export default ApplicationPage
