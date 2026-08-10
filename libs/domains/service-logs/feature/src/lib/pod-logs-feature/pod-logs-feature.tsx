import { useParams } from '@tanstack/react-router'
import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type Status,
} from 'qovery-typescript-axios'
import { memo } from 'react'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useService } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import { getServiceStatusesById } from '../deployment-logs/deployment-logs-content/deployment-logs-content'
import { ListServiceLogs } from '../list-service-logs/list-service-logs'

// Prevent websocket invalidations when re-rendering the page shell.
const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export interface PodLogsFeatureProps {
  environment: Environment
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
}

export function PodLogsFeature({ environment, deploymentStages, environmentStatus }: PodLogsFeatureProps) {
  const { serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId: environment.id, serviceId, suspense: true })
  const { data: cluster } = useCluster({
    organizationId: environment.organization.id,
    clusterId: environment.cluster_id,
    suspense: true,
  })

  useDocumentTitle(`Service logs ${service ? `- ${service.name}` : '- Loading...'}`)

  const serviceStatus = getServiceStatusesById(deploymentStages, serviceId) as Status

  if (!cluster) return null

  return (
    <div className="h-full w-full overflow-hidden">
      <ListServiceLogs
        cluster={cluster}
        environment={environment}
        serviceStatus={serviceStatus}
        environmentStatus={environmentStatus}
      />
      {service && (
        <WebSocketListenerMemo
          organizationId={environment.organization.id}
          clusterId={environment.cluster_id}
          projectId={environment.project.id}
          environmentId={environment.id}
          serviceId={service.id}
          serviceType={service.serviceType}
        />
      )}
    </div>
  )
}

export default PodLogsFeature
