import { type DraggableProvided, type DraggableStateSnapshot } from 'react-beautiful-dnd'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import { ServiceIcon, Truncate } from '@qovery/shared/ui'
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

  const serviceType = service?.serviceType

  const classNameItem = (isDragging: boolean) =>
    `flex items-center bg-neutral-50 rounded px-2 py-3 border ${
      isDragging ? 'border-2 border-green-500' : 'border-neutral-200'
    }`

  const contentWithParams = service?.serviceType === 'DATABASE'

  const content = (name = '', type = '', mode = '') => {
    return (
      <div className={`text-neutral-400 font-medium ${contentWithParams ? 'text-xs' : 'text-ssm'}`}>
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
      {serviceType && <ServiceIcon className="mr-2" service={service} />}
      {content(service?.name, (service as Database)?.type, (service as Database)?.mode)}
    </div>
  )
}

export default DraggableItem
