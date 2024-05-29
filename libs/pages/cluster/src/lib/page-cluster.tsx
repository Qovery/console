import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { NotFoundPage } from '@qovery/pages/layout'
import { CLUSTER_SETTINGS_GENERAL_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { ROUTER_CLUSTER } from './router/router'

export function PagesCluster() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster, isSuccess } = useCluster({ organizationId, clusterId })

  // cluster can be `undefined` if the `find` method in `select` return nothing. However the query itself is still success.
  // Don't seems to have a better way for this case in react-query for now
  // https://github.com/TanStack/query/issues/1540
  // https://github.com/TanStack/query/issues/5878
  if (!cluster && isSuccess) {
    return <NotFoundPage />
  }

  return (
    <Routes>
      {ROUTER_CLUSTER.map((route) => (
        <Route key={route.path} path={route.path} element={route.component} />
      ))}
      <Route
        path="*"
        element={
          <Navigate
            replace
            to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_GENERAL_URL}
          />
        }
      />
    </Routes>
  )
}

export default PagesCluster
