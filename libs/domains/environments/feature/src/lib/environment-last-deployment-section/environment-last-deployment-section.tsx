import { useLinkProps, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { Suspense, useContext, useMemo } from 'react'
import { P, match } from 'ts-pattern'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import {
  Button,
  DeploymentAction,
  EmptyState,
  Heading,
  Icon,
  Link,
  Section,
  Skeleton,
  StatusChip,
  Tooltip,
} from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { DropdownServices } from '../environment-deployment-list/dropdown-services/dropdown-services'
import { isDeploymentHistory } from '../environment-deployment-list/environment-deployment-list'
import { useDeployEnvironment } from '../hooks/use-deploy-environment/use-deploy-environment'
import { useDeploymentHistory } from '../hooks/use-deployment-history/use-deployment-history'
import { useEnvironment } from '../hooks/use-environment/use-environment'

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

const EnvironmentLastDeploymentSkeleton = () => {
  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <Heading>Last deployment</Heading>
        <Skeleton width={148} height={14} />
      </div>

      <div className="flex rounded-lg border border-neutral bg-surface-neutral px-4 py-4">
        <div className="flex items-center gap-6">
          <Skeleton width={83} height={20} />
          <div className="flex gap-1.5">
            <Skeleton width={24} height={24} />
            <Skeleton width={24} height={24} />
            <Skeleton width={24} height={24} />
          </div>
          <Skeleton width={74} height={20} />
        </div>
      </div>
    </Section>
  )
}

const EnvironmentLastDeploymentContent = () => {
  const { organizationId = '', environmentId = '', projectId = '' } = useParams({ strict: false })
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: deploymentHistory = [] } = useDeploymentHistory({ environmentId, suspense: true })
  const lastDeployment = useMemo(
    () =>
      deploymentHistory.sort(
        (a, b) => new Date(b.auditing_data.updated_at).getTime() - new Date(a.auditing_data.updated_at).getTime()
      )[0],
    [deploymentHistory]
  )
  const trigger_action = useMemo(() => lastDeployment?.trigger_action || 'UNKNOWN', [lastDeployment])
  const deploymentStartedLabel = useMemo(
    () =>
      match(lastDeployment?.status)
        .with('DEPLOYING', 'RESTARTING', 'BUILDING', 'DELETING', 'CANCELING', 'STOPPING', () => 'Running since')
        .otherwise(() => undefined),
    [lastDeployment?.status]
  )
  const deploymentRelativeTime = useMemo(
    () => (lastDeployment ? `${timeAgo(new Date(lastDeployment.auditing_data.created_at))} ago` : ''),
    [lastDeployment]
  )

  const logsLink = useLinkProps({
    to: '/organization/$organizationId/project/$projectId/environment/$environmentId/deployments',
    params: { organizationId, projectId, environmentId },
  })

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: logsLink.href,
  })

  const handleDeploy = () => {
    deployEnvironment({
      environmentId,
    })
  }

  const handleLaunchDiagnostic = () => {
    if (!lastDeployment) return

    posthog.capture('ai-copilot-troubleshoot-triggered', {
      source: 'environment-last-deployment',
      deployment_id: lastDeployment.identifier.execution_id,
      trigger_reason: 'error',
    })

    const message = `Why did my deployment fail?${lastDeployment.identifier.execution_id ? ` (deployment id: ${lastDeployment.identifier.execution_id})` : ''}`

    setDevopsCopilotOpen(true)
    sendMessageRef?.current?.(message)
  }

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <Heading>Last deployment</Heading>
        {lastDeployment && (
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployments"
            params={{ organizationId, projectId, environmentId }}
            color="neutral"
            size="ssm"
            className="gap-0.5 text-neutral-subtle hover:text-neutral"
          >
            See all deployments
            <Icon iconName="angle-right" iconStyle="regular" />
          </Link>
        )}
      </div>

      {lastDeployment ? (
        <div className="flex flex-col">
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId"
            params={{ organizationId, environmentId, deploymentId: lastDeployment.identifier.execution_id }}
            className="relative flex rounded-lg border border-neutral bg-surface-neutral px-4 py-2 font-normal transition-colors hover:bg-surface-neutral-subtle"
          >
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-neutral">
              <div className="flex items-center justify-between gap-1.5">
                <DeploymentAction status={trigger_action} className="gap-1.5" textClassName="font-medium" />
                {match(lastDeployment)
                  .with(P.when(isDeploymentHistory), (data) => {
                    return <StatusChip status={data.action_status} />
                  })
                  .otherwise(() => (
                    <StatusChip status="QUEUED" />
                  ))}
              </div>
              <DotSeparator />
              {environment && lastDeployment.stages && (
                <DropdownServices
                  environment={environment}
                  deploymentHistory={lastDeployment}
                  stages={lastDeployment.stages.filter((stage) => stage.services.length > 0)}
                  size="sm"
                />
              )}
              <DotSeparator />
              <div className="text-neutral-subtle">
                {deploymentStartedLabel ? `${deploymentStartedLabel} ` : ''}
                <Tooltip content={dateUTCString(lastDeployment.auditing_data.created_at)}>
                  <span>{deploymentRelativeTime}</span>
                </Tooltip>
              </div>
            </div>
          </Link>
          {lastDeployment.action_status === 'ERROR' && (
            <div className="-mt-3 flex items-center justify-between gap-3 rounded-b-lg border border-neutral bg-surface-brand-subtle px-4 pb-3 pt-6 text-ssm text-brand">
              <div className="flex min-w-0 items-center gap-1.5">
                <Icon iconName="sparkles" iconStyle="solid" className="shrink-0" />
                <span className="truncate">
                  AI Copilot identified likely causes and fixes for this deployment error
                </span>
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
      ) : (
        <EmptyState
          icon="rocket"
          title="No deployment recorded yet"
          description="Create and deploy your first service"
          className="h-auto p-8"
        >
          <Button onClick={handleDeploy} color="neutral" size="md" className="gap-1.5">
            <Icon iconName="rocket" />
            Deploy environment
          </Button>
        </EmptyState>
      )}
    </Section>
  )
}

export const EnvironmentLastDeploymentSection = () => {
  return (
    <Suspense fallback={<EnvironmentLastDeploymentSkeleton />}>
      <EnvironmentLastDeploymentContent />
    </Suspense>
  )
}
