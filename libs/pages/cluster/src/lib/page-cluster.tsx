import { useDispatch } from 'react-redux'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { postClusterActionsDeploy } from '@qovery/domains/organization'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { type AppDispatch } from '@qovery/state/store'
import { ROUTER_CLUSTER } from './router/router'
import Container from './ui/container/container'

export function PagesCluster() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const { data: cluster } = useCluster({ organizationId, clusterId })

  const deployCluster = () =>
    cluster &&
    dispatch(
      postClusterActionsDeploy({
        organizationId,
        clusterId: cluster.id,
      })
    )

  return (
    <Container cluster={cluster} deployCluster={deployCluster}>
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
