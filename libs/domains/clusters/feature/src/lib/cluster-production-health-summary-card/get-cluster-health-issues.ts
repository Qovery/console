import type { IconName } from '@fortawesome/fontawesome-common-types'
import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import type { ClusterStatusDto } from 'qovery-ws-typescript-axios'

export type ClusterHealthIssueKind = 'deploy-failed' | 'running-error' | 'status-unavailable' | 'update-available'

export type ClusterHealthIssueSeverity = 'error' | 'warning'

export interface ClusterHealthIssueMeta {
  kind: ClusterHealthIssueKind
  label: string
  icon: IconName
  severity: ClusterHealthIssueSeverity
}

// Issue groups ordered by severity (most critical first)
export const CLUSTER_HEALTH_ISSUE_ORDER: ClusterHealthIssueKind[] = [
  'deploy-failed',
  'running-error',
  'status-unavailable',
  'update-available',
]

export const CLUSTER_HEALTH_ISSUE_META: Record<ClusterHealthIssueKind, ClusterHealthIssueMeta> = {
  'deploy-failed': {
    kind: 'deploy-failed',
    label: 'Last deployment failed',
    icon: 'rocket',
    severity: 'error',
  },
  'running-error': {
    kind: 'running-error',
    label: 'Cluster in error',
    icon: 'circle-exclamation',
    severity: 'error',
  },
  'status-unavailable': {
    kind: 'status-unavailable',
    label: 'Status unavailable',
    icon: 'circle-exclamation',
    severity: 'warning',
  },
  'update-available': {
    kind: 'update-available',
    label: 'Update available',
    icon: 'rotate-right',
    severity: 'warning',
  },
}

export function getClusterHealthIssuesSeverity(issues: ClusterHealthIssueKind[]): ClusterHealthIssueSeverity | null {
  if (issues.length === 0) return null
  const hasError = issues.some((kind) => CLUSTER_HEALTH_ISSUE_META[kind].severity === 'error')
  return hasError ? 'error' : 'warning'
}

const FAILED_DEPLOYMENT_STATUSES = new Set<ClusterStatus['status']>([
  'BUILD_ERROR',
  'DEPLOYMENT_ERROR',
  'DELETE_ERROR',
  'STOP_ERROR',
  'RESTART_ERROR',
  'INVALID_CREDENTIALS',
])

export interface GetClusterHealthIssuesInput {
  cluster: Cluster
  deploymentStatus?: ClusterStatus
  runningStatus?: ClusterStatusDto | null
  isRunningStatusIssueEnabled?: boolean
}

export function getClusterHealthIssues({
  cluster,
  deploymentStatus,
  runningStatus,
  isRunningStatusIssueEnabled = true,
}: GetClusterHealthIssuesInput): ClusterHealthIssueKind[] {
  const issues: ClusterHealthIssueKind[] = []

  const status = deploymentStatus?.status
  const isStopped = status === 'STOPPED'
  const isDeployed = Boolean(deploymentStatus?.is_deployed)

  if (status && FAILED_DEPLOYMENT_STATUSES.has(status)) {
    issues.push('deploy-failed')
  }

  if (isRunningStatusIssueEnabled && isDeployed && !isStopped) {
    if (runningStatus?.computed_status?.global_status === 'ERROR') {
      issues.push('running-error')
    }

    if (runningStatus === null) {
      issues.push('status-unavailable')
    }
  }

  if (cluster.deployment_status === 'OUT_OF_DATE' && !isStopped) {
    issues.push('update-available')
  }

  return issues
}
