import { useMemo } from 'react'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'
import { useClusterServiceDeploymentStatusSocket } from './use-cluster-service-deployment-status-socket'

export interface ClusterServiceDeploymentStatusSocketsProps {
  organizationId: string
  clusterId: string
}

function EnvironmentServiceDeploymentStatusSocket({
  organizationId,
  clusterId,
  projectId,
  environmentId,
}: ClusterServiceDeploymentStatusSocketsProps & { projectId: string; environmentId: string }) {
  useClusterServiceDeploymentStatusSocket({ organizationId, clusterId, projectId, environmentId })

  return null
}

export function ClusterServiceDeploymentStatusSockets({
  organizationId,
  clusterId,
}: ClusterServiceDeploymentStatusSocketsProps) {
  const { data: environments = [] } = useEnvironmentsByCluster({ organizationId, clusterId })

  const environmentsWithServices = useMemo(
    () =>
      [...environments]
        .filter(({ services }) => services.length > 0)
        .sort((left, right) => left.environment_id.localeCompare(right.environment_id)),
    [environments]
  )

  return (
    <>
      {environmentsWithServices.map(({ environment_id, project_id }) => (
        <EnvironmentServiceDeploymentStatusSocket
          key={environment_id}
          organizationId={organizationId}
          clusterId={clusterId}
          projectId={project_id}
          environmentId={environment_id}
        />
      ))}
    </>
  )
}

export default ClusterServiceDeploymentStatusSockets
