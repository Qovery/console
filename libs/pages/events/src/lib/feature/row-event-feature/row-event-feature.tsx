import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import RowEvent from '../../ui/row-event/row-event'

export interface RowEventFeatureProps {
  event: OrganizationEventResponse
  nbCols?: number
}

export function RowEventFeature(props: RowEventFeatureProps) {
  const { event, nbCols } = props
  const [expanded, setExpanded] = useState(false)

  return <RowEvent event={event} expanded={expanded} setExpanded={setExpanded} nbCols={nbCols} />
}

export default RowEventFeature
