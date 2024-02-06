import { type DeploymentStageWithServicesStatuses, type Status } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { BadgeDeploymentOrder, Icon, IconAwesomeEnum, ServiceIcon, StatusChip } from '@qovery/shared/ui'
import { ServiceStageIdsContext } from '../../feature/service-stage-ids-context/service-stage-ids-context'

export function mergeServices(
  applications?: Status[],
  databases?: Status[],
  containers?: Status[],
  jobs?: Status[],
  helms?: Status[]
) {
  return (
    (applications &&
      databases &&
      containers &&
      jobs &&
      helms && [...applications, ...databases, ...containers, ...jobs, ...helms]) ||
    []
  )
}

export interface SidebarPipelineItemProps {
  index: number
  services: AnyService[]
  currentStage: DeploymentStageWithServicesStatuses
  serviceId?: string
  versionId?: string
}

export function SidebarPipelineItem({ currentStage, index, serviceId, versionId, services }: SidebarPipelineItemProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { updateStageId } = useContext(ServiceStageIdsContext)

  const currentApplication = (serviceId: string) => services.find((service: AnyService) => service.id === serviceId)

  const servicesStages = mergeServices(
    currentStage.applications,
    currentStage.databases,
    currentStage.containers,
    currentStage.jobs,
    currentStage.helms
  )

  const [openStage, setOpenStage] = useState(servicesStages.length > 0)

  useEffect(() => {
    const activeStage = servicesStages.some((service: Status) => service.id === serviceId)
    if (activeStage) {
      currentStage.stage?.id && updateStageId(currentStage.stage.id)
    }
  }, [serviceId, currentStage.stage?.id, servicesStages, updateStageId])

  return (
    <div className="mb-1.5">
      <div
        data-testid="toggle-stage"
        className="cursor-pointer inline-flex items-center text-neutral-100 text-ssm font-medium mb-1.5 select-none"
        onClick={() => setOpenStage(!openStage)}
      >
        <BadgeDeploymentOrder className="mr-3" order={index} />
        {currentStage?.stage?.name}
        <Icon name={IconAwesomeEnum.CARET_DOWN} className={`ml-3 text-neutral-350 ${!openStage ? '-rotate-90' : ''}`} />
      </div>
      {openStage && (
        <div>
          {servicesStages.length > 0 ? (
            servicesStages.map((service, index) => (
              <div
                key={index}
                className={`relative pl-[31px] before:bg-neutral-500 before:block before:content-[''] before:w-[1px] before:h-full before:absolute before:left-[9px] before:top-0 ${
                  serviceId === service.id ? 'before:bg-brand-500 before:w-[3px]' : ''
                }`}
              >
                {currentApplication(service.id) && (
                  <Link
                    key={service.id}
                    to={
                      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                      DEPLOYMENT_LOGS_VERSION_URL(service.id, versionId ? versionId : '')
                    }
                    className={`flex justify-between items-center w-full text-ssm transition-all font-medium py-1.5 px-2.5 hover:text-neutral-50 rounded-[3px] ${
                      serviceId === service.id
                        ? 'bg-neutral-500 !text-neutral-50'
                        : 'text-neutral-100 hover:bg-neutral-600'
                    } ${service.is_part_last_deployment ? '!text-brand-400' : ''}`}
                  >
                    <div className="flex truncate">
                      <ServiceIcon
                        service={currentApplication(service.id)!}
                        className="mr-2.5 mt-0.5"
                        size="16"
                        padding="0"
                        notRounded
                      />
                      <span className="truncate">{currentApplication(service.id)?.name}</span>
                    </div>
                    <StatusChip status={service.state} />
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="text-center pt-1 pb-3">
              <Icon name={IconAwesomeEnum.WAVE_PULSE} className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1">No service for this stage</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SidebarPipelineItem
