import { useParams } from '@tanstack/react-router'
import {
  type DeploymentHistoryEnvironmentV2,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
  ServiceDeploymentStatusEnum,
  type Status,
} from 'qovery-typescript-axios'
import { useService } from '@qovery/domains/services/feature'
import { type DeploymentService } from '@qovery/shared/interfaces'
import { Icon, Link, LoaderDots, StatusChip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { mergeDeploymentServices, trimId } from '@qovery/shared/util-js'

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="0 0 44 44">
      <g clipPath="url(#clip0_19179_165505)">
        <path fill="var(--negative-9)" d="M22 44c12.15 0 22-9.85 22-22S34.15 0 22 0 0 9.85 0 22s9.85 22 22 22"></path>
        <path
          fill="var(--neutral-invert-1)"
          d="M33.446 18.421a3.964 3.964 0 0 1 3.959 3.96 3.97 3.97 0 0 1-3.96 3.959H29.41c-.187-3.927-3.442-7.06-7.413-7.06-3.959 0-7.225 3.133-7.412 7.06h-4.036a3.964 3.964 0 0 1-3.96-3.96c0-2.188 1.782-3.97 3.96-3.97a.34.34 0 0 0 .264-.11.4.4 0 0 0 .11-.275c-.055-1.341.385-2.562 1.254-3.464a4.5 4.5 0 0 1 3.222-1.374c.67 0 1.342.153 1.924.44a.43.43 0 0 0 .308.01.35.35 0 0 0 .198-.22 4.36 4.36 0 0 1 4.168-3.046 4.36 4.36 0 0 1 4.168 3.068c.033.11.11.187.198.22a.38.38 0 0 0 .308-.01 4.26 4.26 0 0 1 1.925-.44c1.22 0 2.397.505 3.233 1.374.869.902 1.309 2.123 1.243 3.453a.34.34 0 0 0 .11.275c.066.055.176.11.264.11"
        ></path>
        <circle cx="22.002" cy="26.952" r="6.6" fill="var(--neutral-invert-1)"></circle>
        <g clipPath="url(#clip1_19179_165505)">
          <path
            fill="var(--negative-9)"
            d="M19.17 24.788a.354.354 0 1 1 0 .707.354.354 0 0 1 0-.707m.472 1.433a1.178 1.178 0 1 0-.943 0v.806h-.942a.47.47 0 1 0 0 .943h3.771v.806a1.178 1.178 0 1 0 .943 0v-.806h3.771a.47.47 0 1 0 0-.943H25.3v-.806a1.178 1.178 0 1 0-.943 0v.806h-4.714zm4.832-1.08a.354.354 0 1 1 .708 0 .354.354 0 0 1-.708 0M22 29.503a.354.354 0 1 1 0 .708.354.354 0 0 1 0-.708"
          ></path>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_19179_165505">
          <path fill="var(--neutral-invert-1)" d="M0 0h44v44H0z"></path>
        </clipPath>
        <clipPath id="clip1_19179_165505">
          <path fill="var(--neutral-invert-1)" d="M17.285 22.785h9.43v9.43h-9.43z"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

function HistoryUnavailableIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="0 0 44 44">
      <g clipPath="url(#clip0_history_unavailable)">
        <path fill="var(--neutral-4)" d="M22 44c12.15 0 22-9.85 22-22S34.15 0 22 0 0 9.85 0 22s9.85 22 22 22"></path>
        <path
          fill="var(--neutral-11)"
          d="M30.683 15.933a.45.45 0 0 0 0-.633L28.2 12.817a.45.45 0 0 0-.633 0l-1.246 1.246-4.004 4.004a.45.45 0 0 1-.634 0l-4.004-4.004-1.246-1.246a.45.45 0 0 0-.633 0L13.317 15.3a.45.45 0 0 0 0 .633l1.246 1.246 4.004 4.004a.45.45 0 0 1 0 .634l-4.004 4.004-1.246 1.246a.45.45 0 0 0 0 .633l2.483 2.483a.45.45 0 0 0 .633 0l1.246-1.246 4.004-4.004a.45.45 0 0 1 .634 0l4.004 4.004 1.246 1.246a.45.45 0 0 0 .633 0l2.483-2.483a.45.45 0 0 0 0-.633l-1.246-1.246-4.004-4.004a.45.45 0 0 1 0-.634l4.004-4.004z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_history_unavailable">
          <path fill="#fff" d="M0 0h44v44H0z"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

export function LoaderPlaceholder({
  title = 'Deployment logs are loading…',
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 text-center">
      <LoaderDots />
      <div className="flex flex-col gap-3">
        <p className="text-neutral">{title}</p>
        <span className="text-sm text-neutral-subtle">{description}</span>
      </div>
    </div>
  )
}

function DeploymentHistoryPlaceholder({
  serviceName,
  deploymentsByServiceId,
}: {
  serviceName: string
  deploymentsByServiceId: DeploymentService[]
}) {
  const { organizationId = '', projectId = '', environmentId = '', executionId = '' } = useParams({ strict: false })

  return (
    <div className="text-center">
      <div>
        <p className="mb-1 font-medium text-neutral">
          {serviceName} service was not deployed within this deployment execution.
        </p>
        <p className="mb-10 text-sm font-normal text-neutral-subtle">
          Below the list of executions where this service was deployed.
        </p>
      </div>
      <div className="w-[484px] overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
        <div className="border-b border-neutral bg-surface-neutral-component py-3 font-medium text-neutral">
          Last deployment logs
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {deploymentsByServiceId.length > 0 ? (
            deploymentsByServiceId.map((deploymentHistory: DeploymentService) => (
              <div key={deploymentHistory.execution_id} className="flex items-center pb-2 last:pb-0">
                <Link
                  className={`flex w-full justify-between rounded bg-surface-neutral-component p-3 transition hover:bg-surface-neutral-componentHover ${
                    executionId === deploymentHistory.execution_id ? 'bg-surface-neutral-componentHover' : ''
                  }`}
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                  params={{
                    organizationId,
                    projectId,
                    environmentId,
                    serviceId: deploymentHistory.identifier.service_id,
                    executionId: deploymentHistory.execution_id,
                  }}
                >
                  <span className="flex">
                    <StatusChip className="relative top-[2px] mr-3" status={deploymentHistory.status} />
                    <span className="text-ssm text-brand">{trimId(deploymentHistory.execution_id || '')}</span>
                  </span>
                  <span className="text-ssm text-neutral-subtle">
                    {dateFullFormat(deploymentHistory.auditing_data.created_at)}
                  </span>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral">No history deployment available for this service.</p>
          )}
        </div>
        <div className="flex h-9 items-center justify-center border-t border-neutral bg-surface-neutral-component">
          <p className="text-xs font-normal text-neutral-subtle">
            Only the last 20 deployments of the environment over the last 30 days are available.
          </p>
        </div>
      </div>
    </div>
  )
}

export interface DeploymentLogsPlaceholderProps {
  environment: Environment
  environmentStatus?: EnvironmentStatus
  serviceStatus?: Status
  itemsLength?: number
  environmentDeploymentHistory?: DeploymentHistoryEnvironmentV2[]
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}

export function DeploymentLogsPlaceholder({
  environment,
  environmentStatus,
  serviceStatus,
  itemsLength,
  environmentDeploymentHistory,
  preCheckStage,
}: DeploymentLogsPlaceholderProps) {
  const { serviceId = '', executionId = '' } = useParams({ strict: false })

  const {
    state: serviceState,
    service_deployment_status: serviceDeploymentStatus,
    is_part_last_deployment: isPartLastDeployment,
  } = serviceStatus || {}

  const { data: service } = useService({ environmentId: environment.id, serviceId, suspense: true })
  const hideLogs = !isPartLastDeployment

  const outOfDateOrUpToDate =
    serviceDeploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED ||
    serviceDeploymentStatus === ServiceDeploymentStatusEnum.UP_TO_DATE

  const deploymentsByServiceId = mergeDeploymentServices(environmentDeploymentHistory).filter(
    (deployment) => deployment.identifier.service_id === serviceId
  )

  // Show loader when data is loading or service is undefined
  if (!service || (itemsLength === 0 && !hideLogs && serviceDeploymentStatus === undefined)) {
    return <LoaderPlaceholder />
  }

  // Show queued state
  if (!serviceStatus?.steps && serviceState?.includes('QUEUED')) {
    return (
      <LoaderPlaceholder
        title="The service is in the queue…"
        description="The logs will be displayed automatically as soon as the deployment starts."
      />
    )
  }

  // Show no logs available state
  if (hideLogs && service && deploymentsByServiceId.length === 0 && outOfDateOrUpToDate) {
    if (serviceDeploymentStatus === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
      return <p className="text-neutral">No logs on this execution for {service.name}.</p>
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <HistoryUnavailableIcon />
        <div className="flex flex-col gap-3">
          <p className="text-neutral">Deployment logs are no longer available due to the deployment's age.</p>
          <span className="text-sm text-neutral-subtle">No logs to display.</span>
        </div>
      </div>
    )
  }

  // Show deployment history
  if (hideLogs && service) {
    return <DeploymentHistoryPlaceholder serviceName={service.name} deploymentsByServiceId={deploymentsByServiceId} />
  }

  // Show canceled state
  if (
    !serviceStatus?.steps &&
    !environmentStatus?.last_deployment_state?.includes('ERROR') &&
    serviceState?.includes('CANCEL')
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="0 0 44 44">
          <g clipPath="url(#clip0_19290_138219)">
            <path
              fill="var(--neutral-2)"
              d="M22 44c12.15 0 22-9.85 22-22S34.15 0 22 0 0 9.85 0 22s9.85 22 22 22"
            ></path>
            <path
              fill="var(--neutral-10)"
              d="M30.683 15.933a.45.45 0 0 0 0-.633L28.2 12.817a.45.45 0 0 0-.633 0l-1.246 1.246-4.004 4.004a.45.45 0 0 1-.634 0l-4.004-4.004-1.246-1.246a.45.45 0 0 0-.633 0L13.317 15.3a.45.45 0 0 0 0 .633l1.246 1.246 4.004 4.004a.45.45 0 0 1 0 .634l-4.004 4.004-1.246 1.246a.45.45 0 0 0 0 .633l2.483 2.483a.45.45 0 0 0 .633 0l1.246-1.246 4.004-4.004a.45.45 0 0 1 .634 0l4.004 4.004 1.246 1.246a.45.45 0 0 0 .633 0l2.483-2.483a.45.45 0 0 0 0-.633l-1.246-1.246-4.004-4.004a.45.45 0 0 1 0-.634l4.004-4.004z"
            ></path>
          </g>
          <defs>
            <clipPath id="clip0_19290_138219">
              <path fill="var(--neutral-invert-1)" d="M0 0h44v44H0z"></path>
            </clipPath>
          </defs>
        </svg>
        <div className="flex flex-col gap-3">
          <p className="text-neutral">Deployment has been canceled.</p>
          <span className="text-sm text-neutral-subtle">No logs to display.</span>
        </div>
      </div>
    )
  }

  // Show precheck error state
  if (preCheckStage?.status === 'ERROR') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <ErrorIcon />
        <span className="text-neutral">An error occurred during the precheck step.</span>
        <Link
          className="gap-1.5"
          as="button"
          variant="surface"
          color="neutral"
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId/pre-check-logs"
          params={{
            organizationId: environment.organization.id,
            projectId: environment.project.id,
            environmentId: environment.id,
            deploymentId: executionId,
          }}
        >
          Open precheck
          <Icon iconName="list-check" />
        </Link>
      </div>
    )
  }

  // Show deployment error state
  if (
    serviceDeploymentStatus &&
    !serviceStatus?.steps &&
    (serviceState?.includes('ERROR') || environmentStatus?.last_deployment_state?.includes('ERROR'))
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <ErrorIcon />
        <span className="text-neutral">An error occurred during deployment of another service.</span>
        <Link
          className="gap-1.5"
          as="button"
          variant="surface"
          color="neutral"
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId"
          params={{
            organizationId: environment.organization.id,
            projectId: environment.project.id,
            environmentId: environment.id,
            deploymentId: executionId,
          }}
        >
          Open pipeline
          <Icon iconName="timeline" />
        </Link>
      </div>
    )
  }

  // Default fallback
  return <LoaderPlaceholder />
}

export default DeploymentLogsPlaceholder
