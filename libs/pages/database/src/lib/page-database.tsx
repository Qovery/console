import { useContext, useEffect } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import {
  AUDIT_LOGS_PARAMS_URL,
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { SpotlightContext } from '@qovery/shared/spotlight/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_DATABASE } from './router/router'
import Container from './ui/container/container'

export function PageDatabase() {
  const { databaseId = '', environmentId = '', organizationId = '', projectId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: databaseId })

  useDocumentTitle(`${service?.name || 'Database'} - Qovery`)

  const { setQuickActions } = useContext(SpotlightContext)
  useEffect(() => {
    if (!service) {
      return
    }

    setQuickActions([
      {
        label: 'See deployment logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(service.id),
      },
      {
        label: 'See live logs',
        iconName: 'scroll',
        link: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(service.id),
      },
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          targetId: service.id,
          targetType: service.serviceType,
          projectId,
          environmentId,
        }),
      },
    ])
  }, [service, projectId, environmentId, organizationId])

  return (
    <Container service={service as AnyService} environment={environment}>
      <Routes>
        {ROUTER_DATABASE.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Container>
  )
}

export default PageDatabase
