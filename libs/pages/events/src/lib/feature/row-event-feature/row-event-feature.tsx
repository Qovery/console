import { OrganizationEventResponse } from 'qovery-typescript-axios'
import RowEvent from '../../ui/row-event/row-event'

export interface RowEventFeatureProps {
  event: OrganizationEventResponse
}

export function RowEventFeature(props: RowEventFeatureProps) {
  const { event } = props

  return <RowEvent event={event} />
}

export default RowEventFeature
