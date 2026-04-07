import { useMemo } from 'react'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'
import { useClusterServiceRunningStatusSocket } from './use-cluster-service-running-status-socket'

export interface ClusterServiceRunningStatusSocketsProps {
  organizationId: string
  clusterId: string
}

function ProjectServiceRunningStatusSocket({
  organizationId,
  clusterId,
  projectId,
}: ClusterServiceRunningStatusSocketsProps & { projectId: string }) {
  useClusterServiceRunningStatusSocket({ organizationId, clusterId, projectId })

  return null
}

export function ClusterServiceRunningStatusSockets({
  organizationId,
  clusterId,
}: ClusterServiceRunningStatusSocketsProps) {
  const { data: environments = [] } = useEnvironmentsByCluster({ organizationId, clusterId })

  const projectIds = useMemo(
    () =>
      [...new Set(environments.map(({ project_id }) => project_id))].sort((left, right) => left.localeCompare(right)),
    [environments]
  )

  return (
    <>
      {projectIds.map((projectId) => (
        <ProjectServiceRunningStatusSocket
          key={projectId}
          organizationId={organizationId}
          clusterId={clusterId}
          projectId={projectId}
        />
      ))}
    </>
  )
}

export default ClusterServiceRunningStatusSockets
