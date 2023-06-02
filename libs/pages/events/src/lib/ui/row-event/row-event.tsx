import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { Icon, IconAwesomeEnum, Skeleton, TagEvent, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, upperCaseFirstLetter } from '@qovery/shared/utils'
import CopyButton from '../copy-button/copy-button'

export interface RowEventProps {
  event: OrganizationEventResponse
  expanded: boolean
  columnsWidth: string
  setExpanded: (expanded: boolean) => void
  isPlaceholder?: boolean
}

export function RowEvent(props: RowEventProps) {
  const { event, expanded, setExpanded, isPlaceholder, columnsWidth } = props

  return (
    <>
      <div
        data-testid="row-event"
        className="grid h-11 py-2.5 items-center text-xs text-text-500 font-medium border-b-element-light-lighter-400 border-b hover:bg-element-light-lighter-200 last:border-b-0"
        style={{ gridTemplateColumns: columnsWidth }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="px-4 flex gap-3">
          <Skeleton height={16} width={120} show={isPlaceholder}>
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
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <TagEvent eventType={event.event_type} />
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <>{upperCaseFirstLetter(event.target_type)}</>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <Tooltip
              content={
                <div>
                  {event.project_name && (
                    <span>
                      Project: {event.project_name} <br />
                    </span>
                  )}
                  {event.environment_name && (
                    <span>
                      Environment: {event.environment_name} <br />
                    </span>
                  )}
                  Target: {event.target_name}
                </div>
              }
            >
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{event.target_name}</span>
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <span>{upperCaseFirstLetter(event.sub_target_type || '')?.replace('_', ' ')}</span>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <Tooltip content={event.triggered_by || ''}>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{event.triggered_by}</span>
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <span>{upperCaseFirstLetter(event.origin)}</span>
          </Skeleton>
        </div>
      </div>
      {expanded && (
        <div
          className="relative bg-element-light-darker-500 max-h-[388px] overflow-y-auto"
          data-testid="expanded-panel"
        >
          <div className="sticky top-[0px] flex items-center h-7 px-4 bg-element-light-darker-200 text-text-200 text-xs z-[1]">
            Object Status after request (here you can find the JSON returned by our API)
          </div>
          <div className="flex justify-end sticky top-9 z-[1]">
            <CopyButton className="mr-7" content={event.change || ''} />
          </div>
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
