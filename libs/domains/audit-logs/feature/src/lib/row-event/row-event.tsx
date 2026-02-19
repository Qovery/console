import { Link, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { type ValidTargetIds } from '@qovery/domains/audit-logs/data-access'
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
import { CodeDiffEditor, CodeEditor, type DiffStats, Icon, Skeleton, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface RowEventProps {
  event: OrganizationEventResponse
  expanded: boolean
  columnsWidth: string
  setExpanded: (expanded: boolean) => void
  isPlaceholder?: boolean
  validTargetIds?: ValidTargetIds
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
  const { event, expanded, setExpanded, isPlaceholder, columnsWidth, validTargetIds } = props
  const { organizationId = '' } = useParams({ strict: false })
  const [diffStats, setDiffStats] = useState<DiffStats>({ additions: 0, deletions: 0 })

  // Check if target still exists
  const checkTargetExists = (targetType: OrganizationEventTargetType): boolean => {
    const { target_id } = event

    if (!validTargetIds || !target_id) return true // If no validation data, assume exists

    switch (targetType) {
      case OrganizationEventTargetType.APPLICATION:
      case OrganizationEventTargetType.CONTAINER:
      case OrganizationEventTargetType.JOB:
      case OrganizationEventTargetType.HELM:
      case OrganizationEventTargetType.TERRAFORM:
      case OrganizationEventTargetType.DATABASE:
        return validTargetIds.services.has(target_id)
      case OrganizationEventTargetType.PROJECT:
        return validTargetIds.projects.has(target_id)
      case OrganizationEventTargetType.ENVIRONMENT:
        return validTargetIds.environments.has(target_id)
      default:
        return true // For other types, assume they exist
    }
  }

  const renderLink = (targetType: OrganizationEventTargetType) => {
    const { event_type, target_name, project_id, environment_id, target_id } = event

    const targetExists = checkTargetExists(targetType)

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

    if (event_type !== OrganizationEventType.DELETE && targetExists) {
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
      OrganizationEventType.TERRAFORM_FORCE_UNLOCK_SUCCEEDED,
      OrganizationEventType.TERRAFORM_MIGRATE_STATE_SUCCEEDED,
      () => <Icon iconName="circle-check" className="text-positive" />
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
      () => <Icon iconName="hourglass-start" className="text-neutral-subtle" />
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
      () => <Icon iconName="rocket-launch" className="text-neutral-subtle" />
    )
    .with(OrganizationEventType.DELETE, OrganizationEventType.DELETED, () => (
      <Icon iconName="trash-can" className="text-neutral-subtle" />
    ))
    .with(OrganizationEventType.CLONE, () => <Icon iconName="copy" className="text-neutral-subtle" />)
    .with(OrganizationEventType.DRY_RUN, () => <Icon iconName="rotate-right" className="text-neutral-subtle" />)
    .with(OrganizationEventType.MAINTENANCE, () => <Icon iconName="wrench" className="text-neutral-subtle" />)
    .with(OrganizationEventType.FORCE_RUN_SUCCEEDED, () => (
      <Icon iconName="circle-check" className="text-neutral-subtle" />
    ))
    .with(OrganizationEventType.REMOTE_DEBUG, () => <Icon iconName="cloud-arrow-up" className="text-neutral-subtle" />)
    .with(OrganizationEventType.SHELL, () => <Icon iconName="terminal" className="text-neutral-subtle" />)
    .otherwise(() => (isEventTypeFailed ? <Icon iconName="circle-exclamation" className="text-negative" /> : null))

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

  return (
    <>
      <div
        data-testid="row-event"
        className={twMerge(
          clsx(
            'group grid h-12 cursor-pointer items-center border-b border-neutral py-2.5 text-sm font-normal text-neutral last:border-b-0 hover:bg-surface-neutral-subtle'
          )
        )}
        style={{ gridTemplateColumns: columnsWidth }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-3 pl-2">
          <Skeleton height={10} width={130} show={isPlaceholder}>
            <div className="flex items-center gap-3">
              <Icon
                iconName="chevron-down"
                className={`block cursor-pointer text-neutral-subtle ${expanded ? 'rotate-180' : ''}`}
              />
              {event.timestamp && (
                <Tooltip content={dateUTCString(event.timestamp)}>
                  <span className="truncate">{dateFullFormat(event.timestamp, undefined, 'dd MMM, y, HH:mm:ss')}</span>
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
              <span className={isEventTypeFailed ? 'text-negative' : 'text-brand'}>
                {formatEventName(event.event_type ?? '')}
              </span>
              {event.sub_target_type && (
                <span className="text-neutral">
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
              {(() => {
                const targetExists =
                  event.target_type &&
                  event.event_type !== OrganizationEventType.DELETE &&
                  checkTargetExists(event.target_type)

                return (
                  <div
                    className={`flex items-center gap-1 truncate pr-2 ${
                      targetExists
                        ? '-translate-x-3 transition-transform duration-200 hover:text-brand group-hover:translate-x-0'
                        : ''
                    }`}
                  >
                    {targetExists && (
                      <Icon
                        iconName="arrow-right"
                        className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      />
                    )}
                    {event.target_type && renderLink(event.target_type)}
                  </div>
                )
              })()}
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4 text-neutral-subtle">
          <Skeleton height={10} width={80} show={isPlaceholder}>
            <>{upperCaseFirstLetter(event.target_type ?? '')?.replace(/_/g, ' ')}</>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={10} width={80} show={isPlaceholder} className="truncate text-neutral-subtle">
            <Truncate truncateLimit={40} text={event.triggered_by ?? ''} />
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder} className="justify-end">
            <Tooltip content={event.user_agent} disabled={!event.user_agent} side="right">
              <div className="truncate text-neutral-subtle">
                {upperCaseFirstLetter(event.origin)?.replace('_', ' ')}
                {event.user_agent && <Icon iconName="info-circle" iconStyle="regular" className="ml-1.5" />}
                <span className="ml-1.5 inline-block">{getSourceIcon(event.origin)}</span>
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
        <div className="relative flex flex-col border-b border-neutral bg-background" data-testid="expanded-panel">
          <div className="flex h-7 items-center justify-between bg-[#faf9fb] px-4 text-xs">
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
          <div className="relative flex flex-col border-b border-b-neutral-200" data-testid="expanded-panel">
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
