import { ClusterLogs, ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchClusterInfraLogs, selectClusterById } from '@qovery/domains/organization'
import { ErrorLogsProps, LayoutLogs } from '@qovery/shared/ui'
import { dateDifferenceMinutes, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import CardClusterFeature from './feature/card-cluster-feature/card-cluster-feature'
import Row from './ui/row/row'

export function PageInfraLogs() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchLogsAndClusterStatusByInterval = setInterval(() => {
      dispatch(fetchClusterInfraLogs({ organizationId, clusterId }))
    }, 3000)
    dispatch(fetchClusterInfraLogs({ organizationId, clusterId }))
    return () => clearInterval(fetchLogsAndClusterStatusByInterval)
  }, [dispatch, organizationId, clusterId])

  const cluster = useSelector(
    (state: RootState) => selectClusterById(state, clusterId),
    (prevProps, nextProps) => prevProps?.logs?.items?.length === nextProps?.logs?.items?.length
  )

  useDocumentTitle(`Cluster ${cluster ? `- ${cluster?.name} (${cluster?.region}) ` : '- Loading...'}`)

  const firstDate =
    cluster?.logs?.items && cluster?.logs?.items.length > 0 && cluster?.logs?.items[0].timestamp
      ? new Date(cluster?.logs?.items[0].timestamp)
      : undefined

  const errors =
    cluster?.logs &&
    cluster?.logs.items &&
    (cluster?.logs.items
      .map(
        (currentData: ClusterLogs, index: number) =>
          currentData.error && {
            index: index + 1,
            timeAgo:
              cluster?.logs &&
              cluster?.logs.items &&
              cluster?.logs.items[0].timestamp &&
              currentData.timestamp &&
              dateDifferenceMinutes(new Date(currentData.timestamp), new Date(cluster?.logs.items[0].timestamp)),
            step: currentData.step,
            error: currentData.error,
          }
      )
      .filter((error) => error) as ErrorLogsProps[])

  const realErrors = errors?.filter(
    (error: ErrorLogsProps) =>
      error.step === ClusterLogsStepEnum.DELETE_ERROR ||
      error.step === ClusterLogsStepEnum.PAUSE_ERROR ||
      error.step === ClusterLogsStepEnum.CREATE_ERROR
  )

  return (
    <LayoutLogs data={cluster?.logs} tabInformation={<CardClusterFeature />} errors={realErrors}>
      {cluster?.logs?.items &&
        cluster?.logs?.items.map((currentData: ClusterLogs, index: number) => (
          <Row key={index} index={index} data={currentData} firstDate={firstDate} />
        ))}
    </LayoutLogs>
  )
}

export default PageInfraLogs
