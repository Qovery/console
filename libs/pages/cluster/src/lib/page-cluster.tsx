import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useCluster, useDeployCluster } from '@qovery/domains/clusters/feature'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { ROUTER_CLUSTER } from './router/router'
import Container from './ui/container/container'

export function PagesCluster() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutate: deployCluster } = useDeployCluster()

  return (
    <Container
      cluster={cluster}
      deployCluster={() =>
        deployCluster({
          organizationId,
          clusterId,
        })
      }
    >
      <Routes>
        {ROUTER_CLUSTER.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route
          path="*"
          element={<Navigate replace to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL} />}
        />
      </Routes>
    </Container>
  )
}

export default PagesCluster
