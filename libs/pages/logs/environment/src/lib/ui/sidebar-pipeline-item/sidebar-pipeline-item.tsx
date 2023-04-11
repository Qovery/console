import { DeploymentStageWithServicesStatuses, Status } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RunningStatus, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { BadgeDeploymentOrder, BadgeService, Icon, IconAwesomeEnum, StatusChip } from '@qovery/shared/ui'

export function mergeServices(applications?: Status[], databases?: Status[], containers?: Status[], jobs?: Status[]) {
  return (
    (applications && databases && containers && jobs && [...applications, ...databases, ...containers, ...jobs]) || []
  )
}

export interface SidebarPipelineItemProps {
  serviceId: string
  index: number
  services: Array<ApplicationEntity | DatabaseEntity>
  currentStage: DeploymentStageWithServicesStatuses
}

export function SidebarPipelineItem(props: SidebarPipelineItemProps) {
  const { currentStage, index, serviceId, services } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const currentApplication = (serviceId: string) =>
    services.find((service: ApplicationEntity | DatabaseEntity) => service.id === serviceId)

  const servicesStages = mergeServices(
    currentStage.applications,
    currentStage.databases,
    currentStage.containers,
    currentStage.jobs
  )

  const [openStage, setOpenStage] = useState(servicesStages.length > 0)

  return (
    <div className="mb-1.5">
      <div
        data-testid="toggle-stage"
        className="cursor-pointer inline-flex items-center text-text-200 text-ssm font-medium mb-1.5 select-none"
        onClick={() => setOpenStage(!openStage)}
      >
        <BadgeDeploymentOrder className="mr-3" id={currentStage?.stage?.id || ''} order={index} />
        {currentStage?.stage?.name}
        <Icon name={IconAwesomeEnum.CARET_DOWN} className={`ml-3 text-text-400 ${!openStage ? '-rotate-90' : ''}`} />
      </div>
      {openStage && (
        <div>
          {servicesStages.length > 0 ? (
            servicesStages.map((service, index) => (
              <div
                key={index}
                className={`relative pl-[31px] before:bg-element-light-darker-100 before:block before:content-[''] before:w-[1px] before:h-full before:absolute before:left-[9px] before:top-0 ${
                  serviceId === service.id ? 'before:bg-brand-500 before:w-[3px]' : ''
                }`}
              >
                {currentApplication(service.id) && (
                  <Link
                    key={service.id}
                    to={
                      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(service.id)
                    }
                    className={`flex justify-between items-center w-full text-ssm transition-all font-medium py-1.5 px-2.5 hover:text-text-100 rounded-[3px] ${
                      serviceId === service.id
                        ? 'bg-element-light-darker-100 text-text-100'
                        : 'text-text-200 hover:bg-element-light-darker-300'
                    }`}
                  >
                    <span className="flex">
                      <BadgeService
                        className="mr-2.5 mt-0.5"
                        serviceType={getServiceType(currentApplication(service.id) as ApplicationEntity)}
                        buildMode={(currentApplication(service.id) as ApplicationEntity)?.build_mode}
                        size="16"
                        padding="0"
                        notRounded
                      />
                      <span className="truncate max-w-[190px]">{currentApplication(service.id)?.name}</span>
                    </span>
                    <StatusChip status={currentApplication(service.id)?.status?.state || RunningStatus.STOPPED} />
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="text-center pt-1 pb-3">
              <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-text-400" />
              <p className="text-text-400 font-medium text-xs mt-1">No service for this stage</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SidebarPipelineItem
