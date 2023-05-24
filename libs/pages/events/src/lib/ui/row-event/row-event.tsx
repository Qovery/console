import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { Icon, IconAwesomeEnum, Skeleton, TagEvent, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, upperCaseFirstLetter } from '@qovery/shared/utils'
import CopyButton from '../copy-button/copy-button'

export interface RowEventProps {
  event: OrganizationEventResponse
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  isPlaceholder?: boolean
}

export function RowEvent(props: RowEventProps) {
  const { event, expanded, setExpanded, isPlaceholder } = props

  return (
    <>
      <div
        data-testid="row-event"
        className="grid grid-cols-7 h-14 py-3 items-center text-xs text-text-500 font-medium border-b-element-light-lighter-400 border-b hover:bg-element-light-lighter-200 last:border-b-0"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="px-4 flex gap-3">
          <Skeleton height={24} width={120} show={isPlaceholder}>
            <div className="flex gap-3">
              <Icon
                name={IconAwesomeEnum.ANGLE_DOWN}
                className={`text-xs cursor-pointer block ${expanded ? 'rotate-180' : ''}`}
              />
              {dateYearMonthDayHourMinuteSecond(new Date(event.timestamp || ''))}
            </div>
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
        <div className="px-4">
          <Skeleton height={24} width={80} show={isPlaceholder}>
            <Tooltip content="project:environment (service)">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {event.project_name ? `${event.project_name}:` : ''}
                {event.environment_name || ''} ({event.target_name})
              </span>
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={24} width={80} show={isPlaceholder}>
            <span> {event.sub_target_type || ''}</span>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={24} width={80} show={isPlaceholder}>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{event.triggered_by}</span>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={24} width={80} show={isPlaceholder}>
            <span>{upperCaseFirstLetter(event.origin)}</span>
          </Skeleton>
        </div>
      </div>
      {expanded && (
        <div
          className="relative bg-element-light-darker-100 text-red-50 max-h-[388px] overflow-y-auto"
          data-testid="expanded-panel"
        >
          <div className="sticky top-[0px] flex items-center h-7 px-4 bg-element-light-lighter-800 text-text-300 text-xs font-medium z-[1]">
            Object Status after request (here you can find the JSON returned by our API)
          </div>
          <CopyButton className="sticky top-10 right-8 ml-auto z-[1]" content={event.change || ''} />
          <SyntaxHighlighter
            language="json"
            style={dark}
            customStyle={{
              padding: '1rem',
              borderRadius: '0.25rem',
              backgroundColor: 'transparent',
              fontSize: '12px',
              position: 'relative',
              top: '-12px',
              height: 'calc(100% - 12px)',
              zIndex: 0,
            }}
            wrapLines
          >
            {JSON.stringify(JSON.parse(event.change || ''), null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </>
  )
}

export default RowEvent
