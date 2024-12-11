import {
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'
import { Link, useParams } from 'react-router-dom'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
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
import { Badge, Icon, IconAwesomeEnum, Skeleton, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
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

  const renderLink = (targetType: OrganizationEventTargetType) => {
    const { event_type, target_name, project_id, environment_id, target_id } = event

    const customLink = (url: string, content = target_name) => (
      <Link className="cursor-pointer truncate transition hover:text-neutral-350" to={url}>
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
    }

    if (event_type !== OrganizationEventType.DELETE) {
      if (targetType.includes('HELM_REPOSITORY')) return <span>NOT_IMPLEMENTED</span>

      return linkConfig[targetType]()
    } else {
      return <span className="truncate">{target_name}</span>
    }
  }

  const badge = match(event.event_type)
    .with(OrganizationEventType.ACCEPT, () => (
      <Badge color="green">
        Accept <Icon iconName="check" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.CREATE, () => (
      <Badge color="green">
        Create <Icon iconName="check" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.DEPLOYED, OrganizationEventType.STOPPED, OrganizationEventType.RESTARTED, (v) => (
      <Badge color="green">
        {upperCaseFirstLetter(v)}
        <Icon iconName="check" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.DELETE, () => (
      <Badge color="neutral">
        Delete <Icon iconName="eraser" className="ml-1" />
      </Badge>
    ))
    .with(
      OrganizationEventType.DELETED,
      OrganizationEventType.DEPLOY_FAILED,
      OrganizationEventType.STOP_FAILED,
      OrganizationEventType.DELETE_FAILED,
      OrganizationEventType.RESTART_FAILED,
      (v) => (
        <Badge color="neutral">
          {upperCaseFirstLetter(v)}
          <Icon iconName="eraser" className="ml-1" />
        </Badge>
      )
    )
    .with(OrganizationEventType.UPDATE, () => (
      <Badge color="sky">
        Update <Icon iconName="rotate" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.TRIGGER_CANCEL, () => (
      <Badge color="neutral">
        Trigger Cancel <Icon iconName="xmark" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.TRIGGER_DELETE, () => (
      <Badge color="neutral">
        Trigger Delete <Icon iconName="eraser" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.TRIGGER_DEPLOY, () => (
      <Badge color="neutral">
        Trigger Deploy <Icon iconName="check" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.TRIGGER_REDEPLOY, () => (
      <Badge color="neutral">
        Trigger Redeploy <Icon iconName="check" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.TRIGGER_STOP, () => (
      <Badge color="sky">
        Trigger Stop <Icon iconName="xmark" className="ml-1" />
      </Badge>
    ))
    .with(OrganizationEventType.TRIGGER_RESTART, () => (
      <Badge color="sky">
        Trigger Restart <Icon iconName="rotate-right" className="ml-1" />
      </Badge>
    ))
    .otherwise((v) => (
      <Badge color="neutral">
        {upperCaseFirstLetter(v)}
        <Icon iconName="rotate" className="ml-1" />
      </Badge>
    ))

  return (
    <>
      <div
        data-testid="row-event"
        className="grid h-11 items-center border-b border-b-neutral-200 py-2.5 text-xs font-medium text-neutral-400 last:border-b-0 hover:bg-neutral-100"
        style={{ gridTemplateColumns: columnsWidth }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex gap-3 px-4">
          <Skeleton height={10} width={120} show={isPlaceholder}>
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
        </div>
        <div className="px-4" data-testid="tag">
          <Skeleton height={10} width={80} show={isPlaceholder}>
            {badge}
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={10} width={80} show={isPlaceholder}>
            <>{upperCaseFirstLetter(event.target_type)}</>
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
              {event.target_type && renderLink(event.target_type)}
            </Tooltip>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={10} width={80} show={isPlaceholder}>
            <span className="truncate">{upperCaseFirstLetter(event.sub_target_type ?? '')?.replace('_', ' ')}</span>
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={10} width={80} show={isPlaceholder} className="truncate">
            <Truncate truncateLimit={30} text={event.triggered_by ?? ''} />
          </Skeleton>
        </div>
        <div className="px-4">
          <Skeleton height={16} width={80} show={isPlaceholder}>
            <Tooltip content={event.user_agent} disabled={!event.user_agent} side="right">
              <div className="truncate">
                <span className="mr-1.5 inline-block text-neutral-400">{getSourceIcon(event.origin)}</span>
                {upperCaseFirstLetter(event.origin)?.replace('_', ' ')}
                {event.user_agent && <Icon iconName="info-circle" iconStyle="regular" className="ml-1.5" />}
              </div>
            </Tooltip>
          </Skeleton>
        </div>
      </div>
      {expanded && (
        <div
          className="relative flex max-h-[388px] flex-col-reverse overflow-y-auto bg-neutral-700"
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
              marginTop: '28px',
            }}
            wrapLines
          >
            {JSON.stringify(JSON.parse(event.change || ''), null, 2)}
          </SyntaxHighlighter>
          <div className="absolute top-9 flex w-full justify-end">
            <CopyButton className="mr-7" content={event.change || ''} />
          </div>
          <div className="absolute top-0 w-full">
            <div className="flex h-7 items-center bg-neutral-550 px-4 text-xs text-neutral-100">
              Object Status after request (here you can find the JSON returned by our API)
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RowEvent
