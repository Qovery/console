import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type Status,
} from 'qovery-typescript-axios'
import { memo } from 'react'
import { useParams } from 'react-router-dom'
import { ListServiceLogs, SidebarPodStatuses } from '@qovery/domains/service-logs/feature'
import { useService } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'
import { getServiceStatusesById } from '../deployment-logs-feature/deployment-logs-feature'

// XXX: Prevent web-socket invalidations when re-rendering
const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export interface PodLogsFeatureProps {
  environment: Environment
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
}

export function PodLogsFeature({ environment, deploymentStages, environmentStatus }: PodLogsFeatureProps) {
  const { serviceId = '' } = useParams()
  const { data: service } = useService({ environmentId: environment.id, serviceId })

  useDocumentTitle(`Service logs ${service ? `- ${service?.name}` : '- Loading...'}`)

  const serviceStatus = getServiceStatusesById(deploymentStages, serviceId) as Status

  return (
    <div className="h-full w-full bg-neutral-900">
      <SidebarPodStatuses
        organizationId={environment.organization.id}
        projectId={environment.project.id}
        service={service}
      >
        <ListServiceLogs
          environment={environment}
          clusterId={environment.cluster_id}
          serviceStatus={serviceStatus}
          environmentStatus={environmentStatus}
        />
      </SidebarPodStatuses>
      {service && environment && (
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
