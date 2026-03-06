import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import {
  ClusterHeaderLogs,
  ClusterLogRow,
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

  // `useEffect` used to scroll to the bottom of the logs when we add data
  useEffect(() => {
    refScrollSection.current?.scroll(0, refScrollSection.current.scrollHeight + 40) // 40px is the padding-bottom
  }, [logs])

  if (!cluster || !clusterStatus) {
    return null
  }

  const firstDate = logs.length > 0 && logs[0].timestamp ? new Date(logs[0].timestamp) : undefined

  return (
    <div className="flex h-[calc(100dvh-108px)] w-full flex-col overflow-hidden">
      {isLogsLoading && !isLogsFetched ? (
        <div className="flex h-full flex-1 flex-col items-center justify-center">
          <LoaderDots />
        </div>
      ) : isLogsFetched && logs.length > 0 ? (
        <>
          <div className="flex h-11 min-h-11 w-full items-center justify-end border-b border-neutral bg-surface-neutral-subtle px-1">
            <ClusterHeaderLogs data={logs} refScrollSection={refScrollSection} />
          </div>
          <div ref={refScrollSection} className="w-full flex-1 overflow-y-auto pb-10">
            <div className="flex flex-col">
              {logs.map((log, index) => (
                <ClusterLogRow key={index} data={log} index={index} firstDate={firstDate} />
              ))}
            </div>
          </div>
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
