import { memo, useContext } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  ServiceTerminal,
  ServiceTerminalContext,
  ServiceTerminalProvider,
  useService,
} from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_DATABASE } from './router/router'
import Container from './ui/container/container'

const ServiceTerminalMemo = memo(ServiceTerminal)

function PageDatabaseWrapped() {
  const { databaseId = '', environmentId = '' } = useParams()
  const { open } = useContext(ServiceTerminalContext)
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: databaseId })

  useDocumentTitle(`${service?.name || 'Database'} - Qovery`)

  return (
    <>
      <Container service={service as AnyService} environment={environment}>
        <Routes>
          {ROUTER_DATABASE.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
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
}

export function PageDatabase() {
  return (
    <ServiceTerminalProvider>
      <PageDatabaseWrapped />
    </ServiceTerminalProvider>
  )
}

export default PageDatabase
