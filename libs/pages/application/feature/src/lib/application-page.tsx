import { useDocumentTitle } from '@console/shared/utils'
import { Container } from '@console/pages/application/ui'
import { selectApplicationById, useApplications } from '@console/domains/application'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { selectEnvironmentById } from '@console/domains/environment'
import { RootState } from '@console/shared/interfaces'
import { Application, Environment } from 'qovery-typescript-axios'

export function ApplicationPage() {
  useDocumentTitle('Application - Qovery')
  const { getApplicationsStatus } = useApplications()
  const { applicationId = '', environmentId = '' } = useParams()
  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const application = useSelector<RootState, Application | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  useEffect(() => {
    setTimeout(() => {
      environmentId && getApplicationsStatus(environmentId)
    }, 1000)
  }, [environmentId, getApplicationsStatus])

  return <Container application={application} environment={environment} />
}

export default ApplicationPage
