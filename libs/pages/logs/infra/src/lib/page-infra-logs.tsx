import { useEffect } from 'react'
import { CardCluster, LayoutLogs } from '@console/shared/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { fetchClusterInfraLogs, selectClusterById } from '@console/domains/organization'
import { ClusterLogs } from 'qovery-typescript-axios'
import Row from './ui/row/row'

export function PageInfraLogs() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchServicesStatusByInterval = setInterval(() => {
      dispatch(fetchClusterInfraLogs({ organizationId, clusterId }))
    }, 3000)
    dispatch(fetchClusterInfraLogs({ organizationId, clusterId }))
    return () => clearInterval(fetchServicesStatusByInterval)
  }, [dispatch, organizationId, clusterId])

  const cluster = useSelector((state: RootState) => selectClusterById(state, clusterId), shallowEqual)

  useDocumentTitle(`Cluster ${cluster ? `- ${cluster?.name} (${cluster?.region}) ` : '- Loading...'}`)

  const firstDate =
    cluster?.logs?.items && cluster?.logs?.items.length > 0 && cluster?.logs?.items[0].timestamp
      ? new Date(cluster?.logs?.items[0].timestamp)
      : undefined

  return (
    <LayoutLogs
      data={cluster?.logs}
      tabInformation={
        cluster && (
          <CardCluster
            id={cluster?.id}
            version={cluster?.version}
            status={cluster?.status}
            name={cluster?.name}
            cloud_provider={cluster?.cloud_provider}
            region={cluster?.region}
            organizationId={organizationId}
          />
        )
      }
    >
      {cluster?.logs?.items &&
        cluster?.logs?.items.map((currentData: ClusterLogs, index: number) => (
          <Row key={index} index={index} data={currentData} firstDate={firstDate} />
        ))}
    </LayoutLogs>
  )
}

export default PageInfraLogs
