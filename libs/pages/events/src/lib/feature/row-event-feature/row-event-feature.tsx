import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import RowEvent from '../../ui/row-event/row-event'

export interface RowEventFeatureProps {
  event: OrganizationEventResponse
  columnsWidth: string
  isPlaceholder?: boolean
}

export function RowEventFeature(props: RowEventFeatureProps) {
  const { event, isPlaceholder = false, columnsWidth } = props
  const [expanded, setExpanded] = useState(false)

  return (
    <RowEvent
      event={event}
      expanded={expanded}
      setExpanded={setExpanded}
      isPlaceholder={isPlaceholder}
      columnsWidth={columnsWidth}
    />
  )
}

export default RowEventFeature
