import { memo, useContext } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  ServiceTerminal,
  ServiceTerminalContext,
  ServiceTerminalProvider,
  useService,
  useServiceType,
} from '@qovery/domains/services/feature'
import { NotFoundPage } from '@qovery/pages/layout'
import { APPLICATION_GENERAL_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_APPLICATION } from './router/router'

const ServiceTerminalMemo = memo(ServiceTerminal)

function PageApplicationWrapped() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { open } = useContext(ServiceTerminalContext)
  const { data: environment, error: environmentError } = useEnvironment({ environmentId })
  const { data: serviceType, isSuccess: isSuccessServiceType } = useServiceType({
    environmentId,
    serviceId: applicationId,
  })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  useDocumentTitle(`${service?.name || 'Service'} - Qovery`)

  if (environmentError || (!serviceType && isSuccessServiceType)) {
    return <NotFoundPage error={environmentError} />
  }

  return match(service)
    .with({ serviceType: 'DATABASE' }, () => null)
    .otherwise((service) => {
      return (
        <>
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
