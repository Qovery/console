import { type DeploymentStageWithServicesStatuses } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { LoaderSpinner } from '@qovery/shared/ui'
import SidebarPipelineItem from '../sidebar-pipeline-item/sidebar-pipeline-item'

export interface SidebarPipelineProps {
  services: AnyService[]
  serviceId?: string
  versionId?: string
  statusStages?: DeploymentStageWithServicesStatuses[]
}

export function SidebarPipeline({ services, versionId, serviceId, statusStages }: SidebarPipelineProps) {
  return (
    <div className="p-5">
      <p className="mb-4 text-xs font-medium text-neutral-50">Pipeline</p>
      {!statusStages ? (
        <div className="flex justify-center">
          <LoaderSpinner className="h-6 w-6" theme="dark" />
        </div>
      ) : (
        statusStages.map((currentStage: DeploymentStageWithServicesStatuses, index: number) => (
          <SidebarPipelineItem
            // Using index key because we don't have generic ID for stages
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
