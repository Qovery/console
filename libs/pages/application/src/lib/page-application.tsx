import { memo, useContext, useEffect } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  ServiceTerminal,
  ServiceTerminalContext,
  ServiceTerminalProvider,
  useService,
} from '@qovery/domains/services/feature'
import {
  APPLICATION_GENERAL_URL,
  APPLICATION_URL,
  AUDIT_LOGS_PARAMS_URL,
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import { SpotlightContext } from '@qovery/shared/spotlight/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_APPLICATION } from './router/router'
import Container from './ui/container/container'

const ServiceTerminalMemo = memo(ServiceTerminal)

function PageApplicationWrapped() {
  const { applicationId = '', environmentId = '', organizationId = '', projectId = '' } = useParams()
  const { open } = useContext(ServiceTerminalContext)
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  useDocumentTitle(`${service?.name || 'Application'} - Qovery`)

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

  return match(service)
    .with({ serviceType: 'DATABASE' }, () => null)
    .otherwise((service) => {
      return (
        <>
          <Container service={service} environment={environment}>
            <Routes>
              {ROUTER_APPLICATION.map((route) => (
                <Route key={route.path} path={route.path} element={route.component} />
              ))}
              <Route
                path="*"
                element={
                  <Navigate
                    replace
                    to={
                      APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL
                    }
                  />
                }
              />
            </Routes>
          </Container>
          {open && environment && service && (
            <ServiceTerminalMemo
              organizationId={environment.organization.id}
              clusterId={environment.cluster_id}
              projectId={environment.project.id}
              environmentId={environment.id}
              serviceId={service.id}
            />
          )}
        </>
      )
    })
}

export function PageApplication() {
  return (
    <ServiceTerminalProvider>
      <PageApplicationWrapped />
    </ServiceTerminalProvider>
  )
}

export default PageApplication
