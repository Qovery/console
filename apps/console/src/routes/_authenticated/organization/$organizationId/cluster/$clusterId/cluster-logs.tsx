import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import {
  ClusterHeaderLogs,
  ClusterLogsList,
  useCluster,
  useClusterLogs,
  useClusterStatus,
} from '@qovery/domains/clusters/feature'
import { EmptyState, LoaderDots } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/cluster-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

  const {
    data: logs = [],
    isLoading: isLogsLoading,
    isFetched: isLogsFetched,
  } = useClusterLogs({
    organizationId,
    clusterId,
    refetchInterval: 3000,
  })
  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { data: clusterStatus } = useClusterStatus({ organizationId, clusterId })

  const refScrollSection = useRef<HTMLDivElement>(null)
  const firstLogTimestamp = logs[0]?.timestamp
  const firstDate = useMemo(() => (firstLogTimestamp ? new Date(firstLogTimestamp) : undefined), [firstLogTimestamp])

  if (!cluster || !clusterStatus) {
    return null
  }

  return (
    <div className="flex h-[calc(100dvh-108px)] w-full flex-col overflow-hidden">
      {isLogsLoading && !isLogsFetched ? (
        <div className="flex h-full flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <LoaderDots />
            <p className="text-neutral">Cluster logs are loading…</p>
          </div>
        </div>
      ) : isLogsFetched && logs.length > 0 ? (
        <>
          <div className="flex h-11 min-h-11 w-full items-center border-b border-neutral bg-background">
            <ClusterHeaderLogs
              cluster={cluster}
              clusterStatus={clusterStatus}
              data={logs}
              refScrollSection={refScrollSection}
            />
          </div>
          <ClusterLogsList logs={logs} firstDate={firstDate} refScrollSection={refScrollSection} />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <EmptyState
            className="border-none bg-transparent"
            title="No logs found"
            description="No logs found for this cluster. Please try again later."
            icon="cube"
          />
        </div>
      )}
    </div>
  )
}
