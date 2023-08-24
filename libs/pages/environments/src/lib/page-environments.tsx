import { type Cluster, type Project } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { getProjectsState } from '@qovery/domains/projects'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { type RootState } from '@qovery/state/store'
import { ROUTER_ENVIRONMENTS } from './router/router'
import Container from './ui/container/container'

export function PageEnvironments() {
  const { organizationId = '', projectId = '' } = useParams()
  const project = useSelector<RootState, Project | undefined>((state) => getProjectsState(state).entities[projectId])
  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

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
