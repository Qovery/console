import { Link, useParams } from '@tanstack/react-router'
import {
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { useFetchValidTargetIds } from '@qovery/domains/audit-logs/data-access'
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
import { Icon, TablePrimitives, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { checkTargetExists, formatEventName, isEventTypeFailed } from './utils'

const { Table } = TablePrimitives

type RowItemProps = {
  event: OrganizationEventResponse
}

const EventSource = ({ event }: { event: OrganizationEventResponse }) => {
  const getSourceIcon = (origin?: OrganizationEventResponse['origin']) => {
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

  return (
    <div className="flex justify-end">
      <Tooltip content={event.user_agent} disabled={!event.user_agent} side="right">
        <div className="text-neutral-subtle truncate">
          {upperCaseFirstLetter(event.origin)?.replace('_', ' ')}
          {event.user_agent && <Icon iconName="info-circle" iconStyle="regular" className="ml-1.5" />}
          <span className="ml-1.5 inline-block">{getSourceIcon(event.origin)}</span>
        </div>
      </Tooltip>
    </div>
  )
}

const EventTarget = ({ event }: { event: OrganizationEventResponse }) => {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: validTargetIds } = useFetchValidTargetIds(organizationId)

  return (
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
          checkTargetExists(event, validTargetIds)

        return (
          <div
            className={`inline-flex items-center gap-2 truncate ${
              targetExists
                ? 'hover:text-brand -ml-2 -translate-x-3 transition-transform duration-200 group-hover:translate-x-0'
                : ''
            }`}
          >
            {targetExists && (
              <Icon
                iconName="arrow-right"
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            )}
            {event.target_type && <EventLink event={event} />}
          </div>
        )
      })()}
    </Tooltip>
  )
}

const EventIcon = ({ event }: { event: OrganizationEventResponse }) => {
  return match(event.event_type)
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
    .otherwise(() =>
      isEventTypeFailed(event) ? <Icon iconName="circle-exclamation" className="text-negative" /> : null
    )
}

const EventLink = ({ event }: { event: OrganizationEventResponse }) => {
  const { organizationId = '' } = useParams({ strict: false })
  const { event_type, target_name } = event
  const projectId = event.project_id ?? ''
  const environmentId = event.environment_id ?? ''
  const targetId = event.target_id ?? ''
  const targetType = event.target_type ?? ''

  const targetExists = checkTargetExists(event)

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
    customLink(`${APPLICATION_URL(organizationId, projectId, environmentId, targetId)}`)

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
      customLink(SETTINGS_URL(organizationId) + SETTINGS_PROJECT_URL(targetId) + SETTINGS_PROJECT_GENERAL_URL),
    [OrganizationEventTargetType.ENVIRONMENT]: () =>
      customLink(SERVICES_URL(organizationId, projectId, targetId), target_name),
    [OrganizationEventTargetType.DATABASE]: () =>
      customLink(DATABASE_URL(organizationId, projectId, environmentId, targetId) + DATABASE_GENERAL_URL),
    [OrganizationEventTargetType.CLUSTER]: () =>
      customLink(CLUSTER_URL(organizationId, targetId) + CLUSTER_SETTINGS_URL),
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

export const RowItem = ({ event }: RowItemProps) => {
  return (
    <Table.Row className="hover:bg-surface-neutral-subtle group">
      <Table.Cell className="border-neutral h-12 border-r">
        {event.timestamp && (
          <Tooltip content={dateUTCString(event.timestamp)}>
            <span className="truncate">{dateFullFormat(event.timestamp, undefined, 'dd MMM, y, HH:mm:ss')}</span>
          </Tooltip>
        )}
      </Table.Cell>
      <Table.Cell className="border-neutral h-12 border-r">
        <div className="flex items-center gap-2">
          <EventIcon event={event} />
          <div className="flex">
            <span className={isEventTypeFailed(event) ? 'text-negative' : 'text-brand'}>
              {formatEventName(event.event_type)}
            </span>
            {event.sub_target_type && (
              <span className="text-neutral"> : {upperCaseFirstLetter(event.sub_target_type)?.replace(/_/g, ' ')}</span>
            )}
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className="border-neutral h-12 border-r">
        {upperCaseFirstLetter(event.target_type ?? '')?.replace(/_/g, ' ')}
      </Table.Cell>
      <Table.Cell className="border-neutral h-12 border-r">
        <div>
          <EventTarget event={event} />
        </div>
      </Table.Cell>
      <Table.Cell className="border-neutral h-12 border-r">
        <Truncate truncateLimit={40} text={event.triggered_by ?? ''} />
      </Table.Cell>
      <Table.Cell className="border-neutral h-12 border-r">
        <EventSource event={event} />
      </Table.Cell>
    </Table.Row>
  )
}
