import {
  OrganizationEventOrigin,
  OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { Link, useParams } from 'react-router-dom'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { IconEnum } from '@qovery/shared/enums'
import {
  APPLICATION_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  SERVICES_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_PROJECT_GENERAL_URL,
  SETTINGS_PROJECT_URL,
  SETTINGS_URL,
} from '@qovery/shared/routes'
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

export const getSourceIcon = (origin?: OrganizationEventOrigin) => {
  switch (origin) {
    case OrganizationEventOrigin.GIT:
      return <Icon name={IconAwesomeEnum.CODE_BRANCH} />
    case OrganizationEventOrigin.CONSOLE:
      return <Icon name={IconAwesomeEnum.BROWSER} />
    case OrganizationEventOrigin.QOVERY_INTERNAL:
      return <Icon name={IconAwesomeEnum.WAVE_PULSE} />
    case OrganizationEventOrigin.API:
      return <Icon name={IconAwesomeEnum.CLOUD_ARROW_UP} />
    case OrganizationEventOrigin.CLI:
      return <Icon name={IconAwesomeEnum.TERMINAL} />
    case OrganizationEventOrigin.TERRAFORM_PROVIDER:
      return <Icon name={IconEnum.TERRAFORM} width="12" />
    default:
      return null
  }
}

export function RowEvent(props: RowEventProps) {
  const { event, expanded, setExpanded, isPlaceholder, columnsWidth } = props
  const { organizationId = '' } = useParams()

  const renderLink = (targetType?: OrganizationEventTargetType) => {
    const { event_type, target_name, project_id, environment_id, target_id } = event

    const customLink = (url: string, content = target_name) => (
      <Link className="truncate cursor-pointer hover:text-text-400 transition" to={url}>
        {content}
      </Link>
    )

    // We don't display the link for delete event because we can't show pages
    if (event_type !== OrganizationEventType.DELETE) {
      switch (targetType) {
        case OrganizationEventTargetType.APPLICATION:
        case OrganizationEventTargetType.CONTAINER:
        case OrganizationEventTargetType.JOB:
          return customLink(APPLICATION_URL(organizationId, project_id!, environment_id!, target_id!))
        case OrganizationEventTargetType.ORGANIZATION:
          return customLink(SETTINGS_URL(organizationId))
        case OrganizationEventTargetType.MEMBERS_AND_ROLES:
          return customLink(SETTINGS_URL(organizationId) + SETTINGS_MEMBERS_URL)
        case OrganizationEventTargetType.PROJECT:
          return customLink(
            SETTINGS_URL(organizationId) + SETTINGS_PROJECT_URL(target_id!) + SETTINGS_PROJECT_GENERAL_URL
          )
        case OrganizationEventTargetType.ENVIRONMENT:
          return customLink(SERVICES_URL(organizationId, project_id!, target_id!), target_name)
        case OrganizationEventTargetType.DATABASE:
          return customLink(
            DATABASE_URL(organizationId, project_id!, environment_id!, target_id!) + DATABASE_GENERAL_URL
          )
        case OrganizationEventTargetType.CLUSTER:
          return customLink(CLUSTER_URL(organizationId, target_id!) + CLUSTER_SETTINGS_URL)
        default:
          return <span className="truncate">{target_name}</span>
      }
    } else {
      return <span className="truncate">{target_name}</span>
    }
  }

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
              <Tooltip content={dateYearMonthDayHourMinuteSecond(new Date(event.timestamp || ''))}>
                <span className="truncate">{dateYearMonthDayHourMinuteSecond(new Date(event.timestamp || ''))}</span>
              </Tooltip>
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
              {renderLink(event.target_type)}
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <span className="truncate">{upperCaseFirstLetter(event.sub_target_type || '')?.replace('_', ' ')}</span>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <Tooltip content={event.triggered_by || ''}>
              <span className="truncate">{event.triggered_by}</span>
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <div className="truncate">
              <span className="inline-block text-text-500 mr-1.5">{getSourceIcon(event.origin)}</span>
              {upperCaseFirstLetter(event.origin)?.replace('_', ' ')}
            </div>
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
