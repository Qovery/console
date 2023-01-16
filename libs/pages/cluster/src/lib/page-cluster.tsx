import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useParams } from 'react-router-dom'
import { fetchClusterStatus, selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
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
      </Routes>
    </Container>
  )
}

export default PagesCluster
