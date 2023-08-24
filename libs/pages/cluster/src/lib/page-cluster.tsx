import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { fetchClusterStatus, selectClusterById } from '@qovery/domains/organization'
import { type ClusterEntity } from '@qovery/shared/interfaces'
import { CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import { ROUTER_CLUSTER } from './router/router'
import Container from './ui/container/container'

export function PagesCluster() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, clusterId)
  )

  useEffect(() => {
    if (!cluster?.extendedStatus) dispatch(fetchClusterStatus({ organizationId, clusterId }))
  }, [dispatch, organizationId, clusterId, cluster])

  return (
    <Container cluster={cluster}>
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
