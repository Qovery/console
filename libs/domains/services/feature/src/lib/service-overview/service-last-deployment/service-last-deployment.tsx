import { useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type ApplicationGitRepository } from 'qovery-typescript-axios'
import { type MouseEvent, Suspense, useContext, useEffect, useState } from 'react'
import { P, match } from 'ts-pattern'
import { type AnyService, type ServiceType } from '@qovery/domains/services/data-access'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { isHelmGitSource, isJobGitSource } from '@qovery/shared/enums'
import {
  Button,
  CopyToClipboard,
  DeploymentAction,
  EmptyState,
  Icon,
  Link,
  Skeleton,
  StatusChip,
  Tooltip,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useDeployService } from '../../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentHistory } from '../../hooks/use-deployment-history/use-deployment-history'
import { LastCommitAuthor, type LastCommitAuthorProps } from '../../last-commit-author/last-commit-author'
import { LastCommit, type LastCommitProps } from '../../last-commit/last-commit'
import { isDeploymentHistory } from '../../service-deployment-list/service-deployment-list'

type DeployServiceType = Exclude<ServiceType, 'CRON_JOB' | 'LIFECYCLE_JOB'>

const DotSeparator = () => (
  <svg
    className="text-neutral-disabled"
    xmlns="http://www.w3.org/2000/svg"
    width="3"
    height="3"
    fill="none"
    viewBox="0 0 3 3"
  >
    <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
  </svg>
)

function getGitRepository(service: AnyService): ApplicationGitRepository | undefined {
  return match(service)
    .with({ serviceType: 'APPLICATION' }, ({ git_repository }) => git_repository)
    .with({ serviceType: 'JOB', source: P.when(isJobGitSource) }, ({ source }) => source.docker?.git_repository)
    .with({ serviceType: 'HELM', source: P.when(isHelmGitSource) }, ({ source }) => source.git?.git_repository)
    .with({ serviceType: 'TERRAFORM' }, ({ terraform_files_source }) => terraform_files_source?.git?.git_repository)
    .otherwise(() => undefined)
}

export interface ServiceLastDeploymentProps {
  serviceId: string
  serviceType: Parameters<typeof useDeploymentHistory>[0]['serviceType']
  service?: AnyService
}
export function ServiceLastDeploymentSkeleton() {
  return (
    <div className="flex gap-2.5 rounded-lg border border-neutral bg-surface-neutral p-4">
      <Skeleton width={100} height={16} />
      <Skeleton width={100} height={16} />
      <Skeleton width={150} height={16} />
    </div>
  )
}

function ServiceLastDeploymentContent({ serviceId, serviceType, service }: ServiceLastDeploymentProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { mutate: deployService } = useDeployService({
    organizationId,
    projectId,
    environmentId,
  })
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)
  const { data: deploymentHistory = [] } = useDeploymentHistory({
    serviceId,
    serviceType,
    suspense: true,
  })

  const lastDeployment = deploymentHistory[0]
  const gitRepository = service ? getGitRepository(service) : undefined
  const showGitCommit =
    Boolean(gitRepository) &&
    Boolean(service?.id && service?.name && service?.serviceType && 'environment' in service && service.environment)

  const isOngoing = match(lastDeployment?.status_details?.status)
    .with('ONGOING', 'CANCELING', () => true)
    .otherwise(() => false)

  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!isOngoing) return
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [isOngoing])

  if (!lastDeployment) {
    return (
      <EmptyState
        icon="play"
        iconStyle="solid"
        title={`${upperCaseFirstLetter(service?.service_type ?? 'Service')} has never been deployed`}
        description={`Deploy the ${service?.serviceType.toLowerCase() ?? 'service'} first`}
      >
        <Button
          className="gap-1"
          color="neutral"
          variant="outline"
          size="md"
          onClick={() => {
            if (serviceType === undefined) {
              return
            }
            deployService({
              serviceId,
              serviceType: match(serviceType)
                .with('APPLICATION', 'CONTAINER', 'DATABASE', 'JOB', 'HELM', 'TERRAFORM', (st): DeployServiceType => st)
                .with('CRON_JOB', 'LIFECYCLE_JOB', (): DeployServiceType => 'JOB')
                .exhaustive(),
            })
          }}
        >
          <Icon iconName="rocket" />
          Deploy now
        </Button>
      </EmptyState>
    )
  }

  const deploymentRelativeTime = `${timeAgo(new Date(lastDeployment.auditing_data.created_at))} ago`

  const preventParentLinkNavigation = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const versionPill = isDeploymentHistory(lastDeployment)
    ? match(lastDeployment.details)
        .with({ repository: P.select({ chart_name: P.string, chart_version: P.string }) }, ({ chart_version }) => (
          <Tooltip content={`Chart version: ${chart_version}`}>
            <span className="inline-flex" onClick={preventParentLinkNavigation}>
              <Button type="button" variant="surface" color="neutral" size="xs" className="gap-1">
                <Icon iconName="code-commit" className="w-4" />
                {chart_version.length >= 18 ? `${chart_version.slice(0, 15)}…` : chart_version}
              </Button>
            </span>
          </Tooltip>
        ))
        .with({ image_name: P.string, tag: P.string }, ({ tag }) => (
          <Tooltip content={`Image tag: ${tag}`}>
            <span className="inline-flex" onClick={preventParentLinkNavigation}>
              <CopyToClipboard text={tag} className="inline-flex justify-center">
                <Button type="button" variant="surface" color="neutral" size="xs" className="gap-1">
                  <Icon iconName="code-commit" className="w-4" />
                  {tag.length >= 8 ? `${tag.slice(0, 8)}…` : tag}
                </Button>
              </CopyToClipboard>
            </span>
          </Tooltip>
        ))
        .otherwise(() => null)
    : null

  const gitBlock =
    showGitCommit && gitRepository && service ? (
      <span className="pointer-events-auto inline-flex items-center gap-2.5">
        <DotSeparator />
        <span className="flex items-center gap-2.5 font-normal" onClick={preventParentLinkNavigation}>
          <LastCommit
            organizationId={organizationId}
            projectId={projectId}
            gitRepository={gitRepository}
            service={service as LastCommitProps['service']}
            showDeployFromAnotherVersionButton={false}
          />
          {'updated_at' in (lastDeployment.auditing_data ?? {}) && lastDeployment.auditing_data.created_at && (
            <>
              <DotSeparator />
              <span className="text-neutral-subtle">
                <Tooltip content={dateUTCString(lastDeployment.auditing_data.created_at)}>
                  <span>{deploymentRelativeTime}</span>
                </Tooltip>
              </span>
            </>
          )}
          <DotSeparator />
          <LastCommitAuthor
            gitRepository={gitRepository}
            serviceId={service.id}
            serviceType={service.serviceType as LastCommitAuthorProps['serviceType']}
            size={20}
            withFullName
          />
        </span>
      </span>
    ) : null

  const handleLaunchDiagnostic = () => {
    posthog.capture('ai-copilot-troubleshoot-triggered', {
      source: 'service-last-deployment',
      deployment_id: lastDeployment.identifier.execution_id,
      trigger_reason: 'error',
    })

    const message = `Why did my deployment fail?${lastDeployment.identifier.execution_id ? ` (deployment id: ${lastDeployment.identifier.execution_id})` : ''}`

    setDevopsCopilotOpen(true)
    sendMessageRef?.current?.(message)
  }

  return (
    <div className="flex flex-col">
      <Link
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
        params={{ organizationId, environmentId, serviceId, executionId: lastDeployment.identifier.execution_id }}
        className="relative flex rounded-lg border border-neutral bg-surface-neutral p-4 transition-colors hover:bg-surface-neutral-subtle"
      >
        <div className="flex flex-wrap items-center gap-2.5 text-sm text-neutral">
          <span className="font-medium">
            <DeploymentAction status={lastDeployment.status_details.status} />
          </span>
          <StatusChip status={lastDeployment.status_details.status} />
          {showGitCommit ? (
            gitBlock
          ) : versionPill ? (
            <>
              <DotSeparator />
              {versionPill}
            </>
          ) : null}
        </div>
      </Link>
      {lastDeployment.status_details.status === 'ERROR' && (
        <div className="-mt-3 flex items-center justify-between gap-3 rounded-b-lg border border-neutral bg-surface-brand-subtle px-4 pb-3 pt-6 text-ssm text-brand">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon iconName="sparkles" iconStyle="solid" className="shrink-0" />
            <span className="truncate">AI Copilot identified likely causes and fixes for this deployment error</span>
          </div>
          <button
            type="button"
            onClick={handleLaunchDiagnostic}
            className="flex shrink-0 items-center gap-0.5 font-medium text-brand transition-opacity hover:opacity-80"
          >
            Launch diagnostic
            <Icon iconName="angle-right" iconStyle="regular" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ServiceLastDeployment(props: ServiceLastDeploymentProps) {
  return (
    <Suspense fallback={<ServiceLastDeploymentSkeleton />}>
      <ServiceLastDeploymentContent {...props} />
    </Suspense>
  )
}
