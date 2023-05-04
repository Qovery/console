import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { Icon, IconAwesomeEnum, Skeleton, TagEvent } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, upperCaseFirstLetter } from '@qovery/shared/utils'

export interface RowEventProps {
  event: OrganizationEventResponse
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  nbCols?: number
  isPlaceholder?: boolean
}

export function RowEvent(props: RowEventProps) {
  const { event, expanded, setExpanded, nbCols, isPlaceholder } = props

  return (
    <div
      data-testid="row-event"
      className={`grid py-5 items-center text-xs text-text-500 font-medium border-b-element-light-lighter-400 border-b hover:bg-element-light-lighter-200 last:border-b-0 grid-cols-${nbCols}`}
    >
      <div className="px-4 flex gap-3">
        <Skeleton height={24} width={120} show={isPlaceholder}>
          <>{dateYearMonthDayHourMinuteSecond(new Date(event.timestamp || ''))}</>
        </Skeleton>
      </div>
      <div className="px-4">
        <Skeleton height={28} width={80} show={isPlaceholder}>
          <TagEvent eventType={event.event_type} />
        </Skeleton>
      </div>
      <div className="px-4">
        <Skeleton height={24} width={80} show={isPlaceholder}>
          <>{upperCaseFirstLetter(event.target_type)}</>
        </Skeleton>
      </div>
      <div className="px-4  whitespace-nowrap overflow-hidden text-ellipsis">
        <Skeleton height={24} width={80} show={isPlaceholder}>
          <>
            {event.target_name}
            {''}
            {event.sub_target_type && `::${event.sub_target_type}`}
          </>
        </Skeleton>
      </div>
      <div className="px-4 flex gap-3">
        <Skeleton height={24} width={80} show={isPlaceholder}>
          <span>API Request</span>
        </Skeleton>
        <div data-testid={'expand-button'} onClick={() => setExpanded(!expanded)}>
          <Icon
            name={IconAwesomeEnum.ANGLE_DOWN}
            className={`text-xs cursor-pointer block ${expanded ? '' : 'rotate-180'}`}
          />
        </div>
      </div>
      <div className="px-4">
        <Skeleton height={24} width={80} show={isPlaceholder}>
          <span>{event.triggered_by}</span>
        </Skeleton>
      </div>
      <div className="px-4">
        <Skeleton height={24} width={80} show={isPlaceholder}>
          <span>{upperCaseFirstLetter(event.origin)}</span>
        </Skeleton>
      </div>
      {expanded && (
        <div
          className={`col-span-${nbCols} bg-element-light-darker-100 -mb-5 mt-5 text-red-50`}
          data-testid="expanded-panel"
        >
          <SyntaxHighlighter
            language="json"
            style={dark}
            customStyle={{
              padding: '1rem',
              borderRadius: '0.25rem',
              backgroundColor: 'transparent',
              fontSize: '12px',
            }}
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
