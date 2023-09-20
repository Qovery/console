import { type DeploymentStageWithServicesStatuses } from 'qovery-typescript-axios'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import { LoaderSpinner } from '@qovery/shared/ui'
import SidebarPipelineItem from '../sidebar-pipeline-item/sidebar-pipeline-item'

export interface SidebarPipelineProps {
  services: Array<ApplicationEntity | DatabaseEntity>
  serviceId?: string
  versionId?: string
  statusStages?: DeploymentStageWithServicesStatuses[]
}

export function SidebarPipeline({ services, versionId, serviceId, statusStages }: SidebarPipelineProps) {
  return (
    <div className="p-5">
      <p className="text-neutral-50 text-xs mb-4 font-medium">Pipeline</p>
      {!statusStages ? (
        <div className="flex justify-center">
          <LoaderSpinner className="w-6" />
        </div>
      ) : (
        statusStages?.map((currentStage: DeploymentStageWithServicesStatuses, index: number) => (
          <SidebarPipelineItem
            key={index}
            index={index}
            versionId={versionId}
            serviceId={serviceId}
            currentStage={currentStage}
            services={services}
          />
        ))
      )}
    </div>
  )
}

export default SidebarPipeline
