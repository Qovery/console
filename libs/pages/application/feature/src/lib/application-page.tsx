import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/application/ui'
import { selectApplicationById } from '@console/domains/application'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { selectEnvironmentById } from '@console/domains/environment'
import { RootState } from '@console/shared/interfaces'
import { Application, Environment } from 'qovery-typescript-axios'

export function ApplicationPage() {
  useDocumentTitle('Application - Qovery')
  const { applicationId = '', environmentId = '' } = useParams()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const application = useSelector<RootState, Application | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  return <Container application={application} environment={environment} />
}

export default ApplicationPage
