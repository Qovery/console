import { OrganizationEventResponse } from 'qovery-typescript-axios'

export interface RowEventProps {
  event: OrganizationEventResponse
}

export function RowEvent(props: RowEventProps) {
  const { event } = props

  return (
    <div>
      <h1>{event.origin}</h1>
    </div>
  )
}

export default RowEvent
