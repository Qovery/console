import { DeploymentStageWithServicesStatuses } from 'qovery-typescript-axios'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import SidebarPipelineItem from '../sidebar-pipeline-item/sidebar-pipeline-item'

export interface SidebarPipelineProps {
  services: Array<ApplicationEntity | DatabaseEntity>
  serviceId: string
  statusStages?: DeploymentStageWithServicesStatuses[]
}

export function SidebarPipeline(props: SidebarPipelineProps) {
  const { serviceId, services, statusStages } = props

  return (
    <div className="p-5">
      <p className="text-text-100 text-xs mb-4 font-medium">Pipeline</p>
      {statusStages?.map((currentStage: DeploymentStageWithServicesStatuses, index: number) => (
        <SidebarPipelineItem
          key={index}
          index={index}
          serviceId={serviceId}
          currentStage={currentStage}
          services={services}
        />
      ))}
    </div>
  )
}

export default SidebarPipeline
