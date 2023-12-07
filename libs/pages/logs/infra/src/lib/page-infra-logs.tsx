import { type ClusterLogs, ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useCluster, useClusterLogs, useClusterStatus } from '@qovery/domains/clusters/feature'
import { displayClusterDeploymentBanner } from '@qovery/pages/layout'
import { type ErrorLogsProps, LayoutLogs } from '@qovery/shared/console-shared'
import { dateDifferenceMinutes } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import CardClusterFeature from './feature/card-cluster-feature/card-cluster-feature'
import Row from './ui/row/row'

export function PageInfraLogs() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: clusterLogs, isLoading: isClusterLogsLoading } = useClusterLogs({
    organizationId,
    clusterId,
    refetchInterval: 3000,
  })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { data: clusterStatus } = useClusterStatus({ organizationId, clusterId })

  useDocumentTitle(`Cluster ${cluster ? `- ${cluster?.name} (${cluster?.region}) ` : '- Loading...'}`)

  const firstDate =
    clusterLogs && clusterLogs.length > 0 && clusterLogs[0].timestamp ? new Date(clusterLogs[0].timestamp) : undefined

  const errors =
    clusterLogs &&
    (clusterLogs
      .map(
        (currentData: ClusterLogs, index: number) =>
          currentData.error && {
            index: index + 1,
            timeAgo:
              clusterLogs &&
              clusterLogs[0].timestamp &&
              currentData.timestamp &&
              dateDifferenceMinutes(new Date(currentData.timestamp), new Date(clusterLogs[0].timestamp)),
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

  const clusterIsDeployed = clusterStatus?.is_deployed
  const clusterBanner = cluster && displayClusterDeploymentBanner(cluster.status) && !clusterIsDeployed

  return (
    <LayoutLogs
      type="infra"
      data={{
        items: clusterLogs,
        loadingStatus: isClusterLogsLoading ? 'loading' : 'loaded',
      }}
      tabInformation={<CardClusterFeature />}
      errors={realErrors}
      clusterBanner={clusterBanner}
    >
      {clusterLogs &&
        clusterLogs.map((currentData: ClusterLogs, index: number) => (
          <Row key={index} index={index} data={currentData} firstDate={firstDate} />
        ))}
    </LayoutLogs>
  )
}

export default PageInfraLogs
