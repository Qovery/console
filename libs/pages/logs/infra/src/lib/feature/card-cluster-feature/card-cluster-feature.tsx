import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { AppDispatch, RootState } from '@console/store/data'
import { fetchClusterStatus, selectClusterById } from '@console/domains/organization'
import { CardCluster } from '@console/shared/ui'

export function CardClusterFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchLogsAndClusterStatusByInterval = setInterval(() => {
      dispatch(fetchClusterStatus({ organizationId, clusterId }))
    }, 3000)
    dispatch(fetchClusterStatus({ organizationId, clusterId }))
    return () => clearInterval(fetchLogsAndClusterStatusByInterval)
  }, [dispatch, organizationId, clusterId])

  const cluster = useSelector((state: RootState) => selectClusterById(state, clusterId))

  return <CardCluster cluster={cluster} organizationId={organizationId} />
}

export default CardClusterFeature
