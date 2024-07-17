import { type DraggableProvided, type DraggableStateSnapshot } from 'react-beautiful-dnd'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { Truncate } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface DraggableItemProps {
  services: AnyService[]
  serviceId: string
  provided?: DraggableProvided
  snapshot?: DraggableStateSnapshot
}

const getServiceByServiceId = (serviceId: string, services: AnyService[]): AnyService | undefined => {
  return services.filter((service) => service.id === serviceId)[0]
}

export function DraggableItem(props: DraggableItemProps) {
  const { services, serviceId, provided, snapshot } = props

  const service = getServiceByServiceId(serviceId || '', services)

  const classNameItem = (isDragging: boolean) =>
    `flex items-center bg-neutral-50 rounded px-2 py-3 border ${
      isDragging ? 'border-2 border-green-500' : 'border-neutral-200'
    }`

  const contentWithParams = service?.serviceType === 'DATABASE'

  const content = (name = '', type = '', mode = '') => {
    return (
      <div className={`font-medium text-neutral-400 ${contentWithParams ? 'text-xs' : 'text-ssm'}`}>
        <Truncate truncateLimit={contentWithParams ? 32 : 27} text={name || ''} />
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
      {service && <ServiceAvatar className="mr-2" service={service} size="sm" border="solid" />}
      {content(service?.name, (service as Database)?.type, (service as Database)?.mode)}
    </div>
  )
}

export default DraggableItem
