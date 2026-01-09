import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { type ValidTargetIds } from '@qovery/domains/event'
import RowEvent from '../../ui/row-event/row-event'

export interface RowEventFeatureProps {
  event: OrganizationEventResponse
  columnsWidth: string
  isPlaceholder?: boolean
  expandedEventTimestamp: string | null
  setExpandedEventTimestamp: (timestamp: string | null) => void
  validTargetIds?: ValidTargetIds
}

export function RowEventFeature(props: RowEventFeatureProps) {
  const {
    event,
    isPlaceholder = false,
    columnsWidth,
    expandedEventTimestamp,
    setExpandedEventTimestamp,
    validTargetIds,
  } = props
  const expanded = expandedEventTimestamp === event.timestamp

  const handleSetExpanded = (shouldExpand: boolean) => {
    setExpandedEventTimestamp(shouldExpand ? event.timestamp! : null)
  }

  return (
    <RowEvent
      event={event}
      expanded={expanded}
      setExpanded={handleSetExpanded}
      isPlaceholder={isPlaceholder}
      columnsWidth={columnsWidth}
      validTargetIds={validTargetIds}
    />
  )
}

export default RowEventFeature
