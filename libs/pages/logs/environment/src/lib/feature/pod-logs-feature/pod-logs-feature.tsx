import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type Status,
} from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { ListServiceLogs } from '@qovery/domains/service-logs/feature'
import { useService } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { getServiceStatusesById } from '../deployment-logs-feature/deployment-logs-feature'

export interface PodLogsFeatureProps {
  environment: Environment
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
}

export function PodLogsFeature({ environment, deploymentStages, environmentStatus }: PodLogsFeatureProps) {
  const { environmentId = '', serviceId = '' } = useParams()
  const { data: service } = useService({ environmentId, serviceId })

  useDocumentTitle(`Service logs ${service ? `- ${service?.name}` : '- Loading...'}`)

  const serviceStatus = getServiceStatusesById(deploymentStages, serviceId) as Status

  return (
    <div className="h-full w-full bg-neutral-800">
      <ListServiceLogs
        environment={environment}
        clusterId={environment.cluster_id}
        serviceStatus={serviceStatus}
        environmentStatus={environmentStatus}
      />
    </div>
  )
}

export default PodLogsFeature
