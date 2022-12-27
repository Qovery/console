import { Cluster, Project } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router-dom'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { getProjectsState } from '@qovery/domains/projects'
import { RootState } from '@qovery/store'
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
      </Routes>
    </Container>
  )
}

export default PageEnvironments
