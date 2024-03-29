import { memo, useContext } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  ServiceTerminal,
  ServiceTerminalContext,
  ServiceTerminalProvider,
  useService,
} from '@qovery/domains/services/feature'
import { APPLICATION_GENERAL_URL, APPLICATION_URL } from '@qovery/shared/routes'
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
