import { CloudProviderEnum, ServiceTypeEnum } from 'qovery-typescript-axios'
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { BadgeService, Truncate } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface DraggableItemProps {
  services: (DatabaseEntity | ApplicationEntity)[]
  serviceId: string
  cloudProvider: CloudProviderEnum
  provided?: DraggableProvided
  snapshot?: DraggableStateSnapshot
}

const getServiceByServiceId = (
  serviceId: string,
  services: (DatabaseEntity | ApplicationEntity)[]
): DatabaseEntity | ApplicationEntity => {
  return services.filter((service) => service.id === serviceId)[0]
}

export function DraggableItem(props: DraggableItemProps) {
  const { services, serviceId, cloudProvider, provided, snapshot } = props

  const service = getServiceByServiceId(serviceId || '', services)
  const serviceType = getServiceType(service)

  const classNameItem = (isDragging: boolean) =>
    `flex items-center drop-shadow-item-deployment-group bg-element-light-lighter-100 rounded px-2 py-3 border ${
      isDragging ? 'border-2 border-success-500' : 'border-element-light-lighter-400'
    }`

  const contentWithParams = serviceType === ServiceTypeEnum.DATABASE

  const content = (name: string, type: string, mode: string) => {
    return (
      <div className={`text-text-500 font-medium ${contentWithParams ? 'text-xs' : 'text-ssm'}`}>
        <Truncate truncateLimit={26} text={name || ''} />
        {contentWithParams && (
          <div data-testid="draggable-item-subtitle" className="text-2xs font-normal">
            {upperCaseFirstLetter(type)} - {upperCaseFirstLetter(mode)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={{ ...provided?.draggableProps.style }}
      className={snapshot && classNameItem(snapshot.isDragging)}
    >
      <BadgeService className="mr-2" serviceType={serviceType} cloudProvider={cloudProvider} />
      {content(service?.name, (service as DatabaseEntity)?.type, (service as DatabaseEntity).mode)}
    </div>
  )
}

export default DraggableItem
