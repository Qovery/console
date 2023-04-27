import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/utils'

export interface RowEventProps {
  event: OrganizationEventResponse
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  nbCols?: number
}

export function RowEvent(props: RowEventProps) {
  const { event, expanded, setExpanded, nbCols } = props

  return (
    <div
      className={`grid py-5 items-center text-xs text-text-500 font-medium border-b-element-light-lighter-400 border-b hover:bg-element-light-lighter-200 last:border-b-0 grid-cols-${nbCols}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-4">
        <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="text-xs mr-3 cursor-pointer" />
        {dateYearMonthDayHourMinuteSecond(new Date(event.timestamp || ''))}
      </div>
      <div className="px-4">{event.event_type}</div>
      <div className="px-4">{event.target_type}</div>
      <div className="px-4  whitespace-nowrap overflow-hidden text-ellipsis">
        {event.target_name}::{event.sub_target_type}
      </div>
      <div className="px-4">{event.change}</div>
      <div className="px-4">{event.triggered_by}</div>
      <div className="px-4">{event.origin}</div>
      {expanded && (
        <div className={`col-span-${nbCols} bg-element-light-darker-100 -mb-5 mt-5 text-red-50`}>
          <SyntaxHighlighter
            language="json"
            customStyle={{ padding: '1rem', borderRadius: '0.25rem', backgroundColor: 'transparent' }}
            wrapLines
          >
            {JSON.stringify(JSON.parse(event.change || ''), null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}

export default RowEvent
