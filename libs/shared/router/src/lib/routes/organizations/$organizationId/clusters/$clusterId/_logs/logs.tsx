import { createFileRoute } from '@tanstack/react-router'
import { type ClusterLogs, ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { useClusterLogs, useClusterStatus } from '@qovery/domains/clusters/feature'
import { dateDifferenceMinutes } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'

export const Route = createFileRoute('/organizations/$organizationId/clusters/$clusterId/_logs/logs')({
  loader: async ({ context: { queryClient }, params: { organizationId, clusterId } }) => {
    const clusters = await queryClient.ensureQueryData({ ...queries.clusters.list({ organizationId }) })
    const cluster = (clusters ?? []).find(({ id }) => id === clusterId)
    if (!cluster) {
      throw Error('Unknown cluster')
    }
    return cluster
  },
  component: PageInfraLogs,
})

function PageInfraLogs() {
  return null
  // const { clusterId, organizationId } = Route.useParams()
  // const cluster = Route.useLoaderData()

  // const { data: clusterLogs, isLoading: isClusterLogsLoading } = useClusterLogs({
  //   organizationId,
  //   clusterId,
  //   refetchInterval: 3000,
  // })
  // const { data: clusterStatus } = useClusterStatus({ organizationId, clusterId })

  // useDocumentTitle(`Cluster - ${cluster.name} (${cluster.region}) `)

  // const firstDate =
  //   clusterLogs && clusterLogs.length > 0 && clusterLogs[0].timestamp ? new Date(clusterLogs[0].timestamp) : undefined

  // const errors =
  //   clusterLogs &&
  //   (clusterLogs
  //     .map(
  //       (currentData: ClusterLogs, index: number) =>
  //         currentData.error && {
  //           index: index + 1,
  //           timeAgo:
  //             clusterLogs &&
  //             clusterLogs[0].timestamp &&
  //             currentData.timestamp &&
  //             dateDifferenceMinutes(new Date(currentData.timestamp), new Date(clusterLogs[0].timestamp)),
  //           step: currentData.step,
  //           error: currentData.error,
  //         }
  //     )
  //     .filter((error) => error) as ErrorLogsProps[])

  // const realErrors = errors?.filter(
  //   (error: ErrorLogsProps) =>
  //     error.step === ClusterLogsStepEnum.DELETE_ERROR ||
  //     error.step === ClusterLogsStepEnum.PAUSE_ERROR ||
  //     error.step === ClusterLogsStepEnum.CREATE_ERROR
  // )

  // const clusterIsDeployed = clusterStatus?.is_deployed
  // const clusterBanner = cluster && displayClusterDeploymentBanner(cluster.status) && !clusterIsDeployed

  // return (
  //   <LayoutLogs
  //     type="infra"
  //     data={{
  //       items: clusterLogs,
  //       loadingStatus: isClusterLogsLoading ? 'loading' : 'loaded',
  //     }}
  //     tabInformation={<CardClusterFeature />}
  //     errors={realErrors}
  //     clusterBanner={clusterBanner}
  //   >
  //     {clusterLogs &&
  //       clusterLogs.map((currentData: ClusterLogs, index: number) => (
  //         <Row key={index} index={index} data={currentData} firstDate={firstDate} />
  //       ))}
  //   </LayoutLogs>
  // )
}

export default PageInfraLogs
