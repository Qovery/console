import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { CLUSTERS_GENERAL_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { ROUTER_CLUSTERS } from './router/router'
import Container from './ui/container/container'

export function PageClusters() {
  const { organizationId = '' } = useParams()

  return (
    <Container>
      <Routes>
        {ROUTER_CLUSTERS.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route path="*" element={<Navigate replace to={CLUSTERS_URL(organizationId) + CLUSTERS_GENERAL_URL} />} />
      </Routes>
    </Container>
  )
}

export default PageClusters
