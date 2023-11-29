import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { ROUTER_ENVIRONMENTS } from './router/router'
import Container from './ui/container/container'

export function PageEnvironments() {
  const { organizationId = '', projectId = '' } = useParams()
  const { data: project } = useProject({ organizationId, projectId })
  const { data: clusters = [] } = useClusters({ organizationId })

  return (
    <Container project={project} clusterAvailable={clusters.length > 0}>
      <Routes>
        {ROUTER_ENVIRONMENTS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route
          path="*"
          element={<Navigate replace to={ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL} />}
        />
      </Routes>
    </Container>
  )
}

export default PageEnvironments
