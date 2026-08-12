import posthog from 'posthog-js'
import {
  type ClusterStateEnum,
  type ClusterStatus,
  DeploymentHistoryTriggerAction,
  DeploymentInfraReason,
} from 'qovery-typescript-axios'
import { useContext } from 'react'
import { match } from 'ts-pattern'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import {
  Badge,
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
import { useIntervalTick } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

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

type ClusterStatusWithDeploymentType = ClusterStatus & {
  trigger_action?: DeploymentHistoryTriggerAction | null
  deployment_type?: DeploymentHistoryTriggerAction | null
  deploy_type?: DeploymentHistoryTriggerAction | null
}

function isDeploymentHistoryTriggerAction(value: unknown): value is DeploymentHistoryTriggerAction {
  return (
    typeof value === 'string' &&
    Object.values(DeploymentHistoryTriggerAction).includes(value as DeploymentHistoryTriggerAction)
  )
}

function getClusterDeploymentAction(clusterStatus: ClusterStatus): DeploymentHistoryTriggerAction | ClusterStateEnum {
  const candidate =
    (clusterStatus as ClusterStatusWithDeploymentType).trigger_action ??
    (clusterStatus as ClusterStatusWithDeploymentType).deployment_type ??
    (clusterStatus as ClusterStatusWithDeploymentType).deploy_type

  if (isDeploymentHistoryTriggerAction(candidate)) {
    return candidate
  }

  return clusterStatus.status
}

function getDeploymentReasonLabel(reason?: ClusterStatus['reason']) {
  if (!reason || reason === DeploymentInfraReason.UNSPECIFIED) {
    return undefined
  }

  return upperCaseFirstLetter(reason.toLowerCase().replace(/_/g, ' '))
}

function ClusterLastDeploymentSkeleton() {
  return (
    <div className="flex gap-2.5 rounded-lg border border-neutral bg-surface-neutral p-4">
      <Skeleton width={100} height={16} />
      <Skeleton width={24} height={16} />
      <Skeleton width={112} height={16} />
    </div>
  )
}

export interface ClusterLastDeploymentSectionProps {
  organizationId: string
  clusterId: string
  clusterStatus?: ClusterStatus
  isLoading?: boolean
}

export function ClusterLastDeploymentSection({
  organizationId,
  clusterId,
  clusterStatus,
  isLoading = false,
}: ClusterLastDeploymentSectionProps) {
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)
  const hasLastDeployment = Boolean(clusterStatus?.last_deployment_date || clusterStatus?.last_execution_id)
  const isOngoing = match(clusterStatus?.status)
    .with(
      'BUILDING',
      'DEPLOYING',
      'DEPLOYMENT_QUEUED',
      'QUEUED',
      'CANCELING',
      'DELETING',
      'STOPPING',
      'RESTARTING',
      () => true
    )
    .otherwise(() => false)
  const deploymentReasonLabel = getDeploymentReasonLabel(clusterStatus?.reason)

  const handleLaunchDiagnostic = () => {
    if (!clusterStatus) return

    posthog.capture('ai-copilot-troubleshoot-triggered', {
      source: 'cluster-last-deployment',
      troubleshoot_type: 'cluster',
      deployment_id: clusterStatus.last_execution_id,
      cluster_id: clusterId,
      trigger_reason: 'error',
    })

    const message = `Why did my cluster deployment fail? (cluster id: ${clusterId})`

    setDevopsCopilotOpen(true)
    sendMessageRef?.current?.(message)
  }

  useIntervalTick(isOngoing)

  return (
    <Section className="gap-3">
      <Heading>Last deployment</Heading>
      {isLoading ? (
        <ClusterLastDeploymentSkeleton />
      ) : clusterStatus && hasLastDeployment ? (
        <div className="flex flex-col">
          <Link
            to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
            params={{ organizationId, clusterId }}
            className="relative flex rounded-lg border border-neutral bg-surface-neutral p-4 transition-colors hover:bg-surface-neutral-subtle"
          >
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-neutral">
              <span className="font-medium">
                <DeploymentAction status={getClusterDeploymentAction(clusterStatus)} />
              </span>
              <StatusChip status={clusterStatus.status} />
              {deploymentReasonLabel && (
                <>
                  <DotSeparator />
                  <Badge color="neutral" variant="surface">
                    {deploymentReasonLabel}
                  </Badge>
                </>
              )}
              {clusterStatus.last_deployment_date && (
                <>
                  <DotSeparator />
                  <span className="text-neutral-subtle">
                    <Tooltip content={dateUTCString(clusterStatus.last_deployment_date)}>
                      <span>{timeAgo(new Date(clusterStatus.last_deployment_date))} ago</span>
                    </Tooltip>
                  </span>
                </>
              )}
            </div>
          </Link>
          {clusterStatus.status === 'DEPLOYMENT_ERROR' && (
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
          size="sm"
          icon="rocket"
          title="No deployment recorded yet"
          description="Deploy the cluster to view deployment logs"
        />
      )}
    </Section>
  )
}
