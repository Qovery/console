import { Route, Routes, useParams } from 'react-router-dom'
import { useCluster, useDeployCluster } from '@qovery/domains/clusters/feature'
import { NotFoundPage } from '@qovery/pages/layout'
import { ROUTER_CLUSTER } from './router/router'
import Container from './ui/container/container'

export function PagesCluster() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster, isFetched } = useCluster({ organizationId, clusterId })
  const { mutate: deployCluster } = useDeployCluster()

  if (!cluster && isFetched) {
    return <NotFoundPage />
  }

  if (cluster) {
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
    )
  } else {
    return null
  }
}

export default PagesCluster
