import {
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import {
  APPLICATION_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  SERVICES_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_PROJECT_GENERAL_URL,
  SETTINGS_PROJECT_URL,
  SETTINGS_URL,
  SETTINGS_WEBHOOKS,
} from '@qovery/shared/routes'
import {
  CodeDiffEditor,
  CodeEditor,
  type DiffStats,
  Icon,
  IconAwesomeEnum,
  Skeleton,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface RowEventProps {
  event: OrganizationEventResponse
  expanded: boolean
  columnsWidth: string
  setExpanded: (expanded: boolean) => void
  isPlaceholder?: boolean
}

const formatEventName = (eventName: string) => {
  return eventName.split('_').map(upperCaseFirstLetter).join(' ')
}

export const getSourceIcon = (origin?: OrganizationEventOrigin) => {
  switch (origin) {
    case OrganizationEventOrigin.GIT:
      return <Icon iconName="code-branch" />
    case OrganizationEventOrigin.CONSOLE:
      return <Icon iconName="browser" />
    case OrganizationEventOrigin.QOVERY_INTERNAL:
      return <Icon iconName="wave-pulse" />
    case OrganizationEventOrigin.API:
      return <Icon iconName="cloud-arrow-up" />
    case OrganizationEventOrigin.CLI:
      return <Icon iconName="terminal" />
    case OrganizationEventOrigin.TERRAFORM_PROVIDER:
      return <Icon name={IconEnum.TERRAFORM} width="12" />
    default:
      return null
  }
}

export function RowEvent(props: RowEventProps) {
  const { event, expanded, setExpanded, isPlaceholder, columnsWidth } = props
  const { organizationId = '' } = useParams()
  const [diffStats, setDiffStats] = useState<DiffStats>({ additions: 0, deletions: 0 })

  const renderLink = (targetType: OrganizationEventTargetType) => {
    const { event_type, target_name, project_id, environment_id, target_id } = event

    const customLink = (url: string, content = target_name) => (
      <Link
        className="cursor-pointer truncate font-medium transition"
        to={url}
        onMouseEnter={(e) => e.currentTarget.closest('.group\\/target')?.classList.add('hovering-link')}
        onMouseLeave={(e) => e.currentTarget.closest('.group\\/target')?.classList.remove('hovering-link')}
      >
        {content}
      </Link>
    )

    const generateApplicationLink = () =>
      customLink(`${APPLICATION_URL(organizationId, project_id!, environment_id!, target_id!)}`)

    const linkConfig: { [key in OrganizationEventTargetType]: () => JSX.Element } = {
      [OrganizationEventTargetType.APPLICATION]: generateApplicationLink,
      [OrganizationEventTargetType.CONTAINER]: generateApplicationLink,
      [OrganizationEventTargetType.JOB]: generateApplicationLink,
      [OrganizationEventTargetType.HELM]: generateApplicationLink,
      [OrganizationEventTargetType.TERRAFORM]: generateApplicationLink,
      [OrganizationEventTargetType.ORGANIZATION]: () => customLink(SETTINGS_URL(organizationId)),
      [OrganizationEventTargetType.MEMBERS_AND_ROLES]: () =>
        customLink(SETTINGS_URL(organizationId) + SETTINGS_MEMBERS_URL),
      [OrganizationEventTargetType.PROJECT]: () =>
        customLink(SETTINGS_URL(organizationId) + SETTINGS_PROJECT_URL(target_id!) + SETTINGS_PROJECT_GENERAL_URL),
      [OrganizationEventTargetType.ENVIRONMENT]: () =>
        customLink(SERVICES_URL(organizationId, project_id!, target_id!), target_name),
      [OrganizationEventTargetType.DATABASE]: () =>
        customLink(DATABASE_URL(organizationId, project_id!, environment_id!, target_id!) + DATABASE_GENERAL_URL),
      [OrganizationEventTargetType.CLUSTER]: () =>
        customLink(CLUSTER_URL(organizationId, target_id!) + CLUSTER_SETTINGS_URL),
      [OrganizationEventTargetType.WEBHOOK]: () => customLink(SETTINGS_URL(organizationId) + SETTINGS_WEBHOOKS),
      [OrganizationEventTargetType.CONTAINER_REGISTRY]: () =>
        customLink(SETTINGS_URL(organizationId) + SETTINGS_CONTAINER_REGISTRIES_URL),
      [OrganizationEventTargetType.ENTERPRISE_CONNECTION]: () =>
        customLink(SETTINGS_URL(organizationId) + SETTINGS_MEMBERS_URL),
      [OrganizationEventTargetType.HELM_REPOSITORY]: () => <span>NOT_IMPLEMENTED</span>,
    }

    if (event_type !== OrganizationEventType.DELETE) {
      return linkConfig[targetType]()
    } else {
      return <span className="truncate">{target_name}</span>
    }
  }

  const isEventTypeFailed = event.event_type?.toLowerCase().includes('fail')

  const eventIcon = match(event.event_type)
    .with(
      OrganizationEventType.CREATE,
      OrganizationEventType.ACCEPT,
      OrganizationEventType.DEPLOYED,
      OrganizationEventType.STOPPED,
      OrganizationEventType.RESTARTED,
      OrganizationEventType.UPDATE,
      OrganizationEventType.DEPLOYED,
      OrganizationEventType.STOPPED,
      OrganizationEventType.DEPLOYED_DRY_RUN,
      () => <Icon iconName="circle-check" className="text-[#30a46c]" />
    )
    .with(
      OrganizationEventType.DELETE_QUEUED,
      OrganizationEventType.STOP_QUEUED,
      OrganizationEventType.RESTART_QUEUED,
      OrganizationEventType.DEPLOY_QUEUED,
      OrganizationEventType.UNINSTALL_QUEUED,
      OrganizationEventType.FORCE_RUN_QUEUED,
      OrganizationEventType.FORCE_RUN_QUEUED_DELETE,
      OrganizationEventType.FORCE_RUN_QUEUED_DEPLOY,
      OrganizationEventType.FORCE_RUN_QUEUED_STOP,
      () => <Icon iconName="hourglass-start" />
    )
    .with(
      OrganizationEventType.TRIGGER_CANCEL,
      OrganizationEventType.TRIGGER_DELETE,
      OrganizationEventType.TRIGGER_CANCEL,
      OrganizationEventType.TRIGGER_DEPLOY,
      OrganizationEventType.TRIGGER_UNINSTALL,
      OrganizationEventType.TRIGGER_DEPLOY_DRY_RUN,
      OrganizationEventType.TRIGGER_FORCE_RUN,
      OrganizationEventType.TRIGGER_FORCE_RUN_DELETE,
      OrganizationEventType.TRIGGER_FORCE_RUN_DEPLOY,
      OrganizationEventType.TRIGGER_FORCE_RUN_STOP,
      OrganizationEventType.TRIGGER_REDEPLOY,
      OrganizationEventType.TRIGGER_RESTART,
      OrganizationEventType.TRIGGER_STOP,
      OrganizationEventType.TRIGGER_TERRAFORM_FORCE_UNLOCK,
      OrganizationEventType.TRIGGER_TERRAFORM_MIGRATE_STATE,
      () => <Icon iconName="rocket-launch" />
    )
    .with(OrganizationEventType.DELETE, OrganizationEventType.DELETED, () => (
      <Icon iconName="trash-can" className="text-neutral-350" />
    ))
    .otherwise(() => (isEventTypeFailed ? <Icon iconName="circle-exclamation" className="text-[#e54d2e]" /> : null))

  const isSuccess = match(event.event_type)
    .with(
      OrganizationEventType.CREATE,
      OrganizationEventType.ACCEPT,
      OrganizationEventType.DEPLOYED,
      OrganizationEventType.STOPPED,
      OrganizationEventType.RESTARTED,
      OrganizationEventType.UPDATE,
      () => true
    )
    .otherwise(() => false)

  const getRowBgClass = () => {
    if (isEventTypeFailed) return 'bg-[rgb(252,242,242)] hover:bg-[rgb(250,227,226)]'
    if (isSuccess) return 'hover:bg-neutral-100'
    return 'hover:bg-neutral-100'
  }

  return (
    <>
      <div
        data-testid="row-event"
        className={`group grid h-12 items-center border-b border-b-neutral-200 py-2.5 text-xs font-normal text-neutral-400 last:border-b-0 hover:bg-neutral-100 ${getRowBgClass()}`}
        style={{ gridTemplateColumns: columnsWidth }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-3 pl-2">
          <Skeleton height={10} width={130} show={isPlaceholder}>
            <div className="flex gap-3">
              <Icon
                name={IconAwesomeEnum.ANGLE_DOWN}
                className={`block cursor-pointer text-xs ${expanded ? 'rotate-180' : ''}`}
              />
              {event.timestamp && (
                <Tooltip content={dateUTCString(event.timestamp)}>
                  <span className="truncate">{dateFullFormat(event.timestamp)}</span>
                </Tooltip>
              )}
            </div>
          </Skeleton>
          <Skeleton height={10} width={16} show={isPlaceholder}>
            {eventIcon}
          </Skeleton>
        </div>
        <div className="px-5" data-testid="tag">
          <Skeleton height={10} width={80} show={isPlaceholder}>
            <span>
              <span className={isEventTypeFailed ? 'text-red-500' : 'text-brand-500'}>
                {formatEventName(event.event_type ?? '')}
              </span>
              {event.sub_target_type && (
                <span className="text-neutral-400">
                  {' '}
                  : {upperCaseFirstLetter(event.sub_target_type)?.replace(/_/g, ' ')}
                </span>
              )}
            </span>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={10} width={80} show={isPlaceholder}>
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
              <div className="flex -translate-x-3 items-center gap-1 truncate pr-2 transition-transform duration-200 hover:text-[rgb(93,48,245)] group-hover:translate-x-0">
                <Icon
                  iconName="arrow-right"
                  className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
                {event.target_type && renderLink(event.target_type)}
              </div>
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={10} width={80} show={isPlaceholder}>
            <>{upperCaseFirstLetter(event.target_type ?? '')?.replace(/_/g, ' ')}</>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={10} width={80} show={isPlaceholder} className="truncate">
            <Truncate truncateLimit={40} text={event.triggered_by ?? ''} />
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder} className="justify-end">
            <Tooltip content={event.user_agent} disabled={!event.user_agent} side="right">
              <div className="truncate">
                {upperCaseFirstLetter(event.origin)?.replace('_', ' ')}
                {event.user_agent && <Icon iconName="info-circle" iconStyle="regular" className="ml-1.5" />}
                <span className="ml-1.5 inline-block text-neutral-400">{getSourceIcon(event.origin)}</span>
              </div>
            </Tooltip>
          </Skeleton>
        </div>
      </div>
      {expanded &&
      event.event_type === OrganizationEventType.UPDATE &&
      event.original_change &&
      event.change &&
      event.original_change !== event.change ? (
        <div className="relative flex flex-col bg-white" data-testid="expanded-panel">
          <div className="flex h-7 items-center justify-between bg-[#faf9fb] px-4 text-xs text-neutral-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#30a46c]">+{diffStats.additions}</span>
              <span className="font-bold text-[#e54d2e]">-{diffStats.deletions}</span>
              <span className="text-[#65636d]">lines changed</span>
            </div>
          </div>
          <CodeDiffEditor
            key={event.timestamp}
            original={JSON.stringify(JSON.parse(event.original_change), null, 2)}
            modified={JSON.stringify(JSON.parse(event.change), null, 2)}
            language="json"
            height={`${Math.min(JSON.stringify(JSON.parse(event.change || ''), null, 2).split('\n').length * 18, 350)}px`}
            onDiffStatsChange={setDiffStats}
          />
        </div>
      ) : (
        expanded && (
          <div className="relative flex flex-col bg-white" data-testid="expanded-panel">
            <CodeEditor
              key={event.timestamp}
              value={JSON.stringify(JSON.parse(event.change || ''), null, 2)}
              language="json"
              height={`${Math.min(JSON.stringify(JSON.parse(event.change || ''), null, 2).split('\n').length * 18, 350)}px`}
              readOnly
              options={{
                overviewRulerLanes: 0,
                renderLineHighlight: 'none',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                selectOnLineNumbers: false,
                stickyScroll: {
                  enabled: false,
                },
                guides: {
                  indentation: false,
                },
              }}
              className={isEventTypeFailed ? 'audit-logs-failed-code-editor' : 'audit-logs-simple-code-editor'}
            />
          </div>
        )
      )}
    </>
  )
}

export default RowEvent
