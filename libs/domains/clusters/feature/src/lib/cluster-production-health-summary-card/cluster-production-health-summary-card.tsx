import type { IconName } from '@fortawesome/fontawesome-common-types'
import { useQueries } from '@tanstack/react-query'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import { type ReactNode, memo, useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { Icon, Skeleton, useModal } from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import {
  ClusterProductionHealthIssuesModal,
  type ClusterWithHealthIssues,
} from '../cluster-production-health-issues-modal/cluster-production-health-issues-modal'
import useClusterRunningStatusSocket from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import {
  CLUSTER_HEALTH_ISSUE_ORDER,
  type ClusterHealthIssueKind,
  getClusterHealthIssues,
  getClusterHealthIssuesSeverity,
} from './get-cluster-health-issues'

// Max time we wait for the running-status websocket to report before we assume
// the connection is slow and render the card anyway (with potential
// "status unavailable" issues). While waiting we display a skeleton to avoid
// flashing incorrect states caused by temporarily missing running-status data.
const RUNNING_STATUS_TIMEOUT_MS = 8_000
const CLUSTER_RUNNING_STATUS_QUERY_OPTIONS = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: Infinity,
} as const

function useClusterRunningStatusQueries({ clusters, enabled }: { clusters: Cluster[]; enabled: boolean }) {
  return useQueries({
    queries: enabled
      ? clusters.map((cluster) => ({
          ...queries.clusters.runningStatus({
            organizationId: cluster.organization.id,
            clusterId: cluster.id,
          }),
          ...CLUSTER_RUNNING_STATUS_QUERY_OPTIONS,
        }))
      : [],
  })
}

// Memoized so parent re-renders (e.g. from the 3s cluster-statuses polling) don't tear down
// the websocket subscription when the cluster identity didn't change.
const ClusterRunningStatusSubscription = memo(function ClusterRunningStatusSubscription({
  organizationId,
  clusterId,
}: {
  organizationId: string
  clusterId: string
}) {
  useClusterRunningStatusSocket({ organizationId, clusterId })
  return null
})

type HealthCardVariant = 'positive' | 'warning' | 'negative' | 'brand'

const VARIANT_STYLES: Record<
  HealthCardVariant,
  { border: string; interactiveBorderHover: string; iconBg: string; iconBgHover: string; iconColor: string }
> = {
  positive: {
    border: 'border-positive-subtle',
    interactiveBorderHover: 'hover:border-positive-strong focus-visible:border-positive-strong',
    iconBg: 'bg-surface-positive-subtle',
    iconBgHover: 'group-hover:bg-surface-positive-component group-focus-visible:bg-surface-positive-component',
    iconColor: 'text-positive',
  },
  warning: {
    border: 'border-warning-subtle',
    interactiveBorderHover: 'hover:border-warning-strong focus-visible:border-warning-strong',
    iconBg: 'bg-surface-warning-subtle',
    iconBgHover: 'group-hover:bg-surface-warning-component group-focus-visible:bg-surface-warning-component',
    iconColor: 'text-warning',
  },
  brand: {
    border: 'border-brand-subtle',
    interactiveBorderHover: 'hover:border-brand-strong focus-visible:border-brand-strong',
    iconBg: 'bg-surface-brand-subtle',
    iconBgHover: 'group-hover:bg-surface-brand-component group-focus-visible:bg-surface-brand-component',
    iconColor: 'text-brand',
  },
  negative: {
    border: 'border-negative-subtle',
    interactiveBorderHover: 'hover:border-negative-strong focus-visible:border-negative-strong',
    iconBg: 'bg-surface-negative-subtle',
    iconBgHover: 'group-hover:bg-surface-negative-component group-focus-visible:bg-surface-negative-component',
    iconColor: 'text-negative',
  },
}

function HealthStatusCard({
  clusters,
  variant,
  iconName,
  title,
  onClick,
}: {
  clusters: Cluster[]
  variant: HealthCardVariant
  iconName: IconName
  title: ReactNode
  onClick?: () => void
}) {
  const styles = VARIANT_STYLES[variant]
  const baseClassName = `flex w-full items-center gap-3 rounded-lg border bg-background p-3 ${styles.border}`
  const interactiveClassName = twMerge(
    `group text-left transition-colors focus:outline-none ${styles.interactiveBorderHover}`,
    baseClassName
  )

  const content = (
    <>
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border transition-colors retina:border-[0.5px] ${styles.border} ${styles.iconBg}${onClick ? ` ${styles.iconBgHover}` : ''}`}
      >
        <Icon iconName={iconName} iconStyle="regular" className={`text-base ${styles.iconColor}`} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-code text-2xs uppercase text-neutral-subtle">
          {pluralize(clusters.length, 'Cluster', 'Clusters')} health
        </span>

        <span className="truncate text-sm font-medium text-neutral">{title}</span>
      </span>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={interactiveClassName}>
        {content}
      </button>
    )
  }

  return <div className={baseClassName}>{content}</div>
}

function getWarningTitle({
  issuesCount,
  groupedIssues,
}: {
  issuesCount: number
  groupedIssues: { kind: ClusterHealthIssueKind }[]
}): ReactNode {
  const hasOnlyAvailableUpdates = groupedIssues.length === 1 && groupedIssues[0]?.kind === 'update-available'

  if (hasOnlyAvailableUpdates) {
    return (
      <>
        Update needed on {issuesCount} {pluralize(issuesCount, 'cluster', 'clusters')}
      </>
    )
  }

  return (
    <>
      {issuesCount} {pluralize(issuesCount, 'cluster', 'clusters')} {pluralize(issuesCount, 'needs', 'need')} attention
    </>
  )
}

function hasOnlyAvailableUpdates(groupedIssues: { kind: ClusterHealthIssueKind }[]) {
  return groupedIssues.length === 1 && groupedIssues[0]?.kind === 'update-available'
}

export interface ClusterProductionHealthSummaryCardProps {
  clusters: Cluster[]
  clusterStatuses: ClusterStatus[]
}

export function ClusterProductionHealthSummaryCard({
  clusters,
  clusterStatuses,
}: ClusterProductionHealthSummaryCardProps) {
  const { openModal, closeModal } = useModal()
  const isRunningStatusIssueEnabled = Boolean(useFeatureFlagVariantKey('cluster-running-status'))
  const runningStatusScopeKey = useMemo(
    () => clusters.map((cluster) => `${cluster.organization.id}:${cluster.id}`).join('|'),
    [clusters]
  )

  const [hasRunningStatusTimedOut, setHasRunningStatusTimedOut] = useState(false)
  useEffect(() => {
    setHasRunningStatusTimedOut(false)
    const timeoutId = setTimeout(() => setHasRunningStatusTimedOut(true), RUNNING_STATUS_TIMEOUT_MS)
    return () => clearTimeout(timeoutId)
  }, [runningStatusScopeKey])

  const runningStatusQueries = useClusterRunningStatusQueries({ clusters, enabled: isRunningStatusIssueEnabled })

  // Keep the skeleton up until every cluster has reported a running status
  // (real payload or explicit 'NotFound'), or the timeout fires as a safety net
  const hasAllRunningStatuses =
    !isRunningStatusIssueEnabled ||
    clusters.length === 0 ||
    runningStatusQueries.every((query) => query.data !== undefined)
  const isReady = hasAllRunningStatuses || hasRunningStatusTimedOut

  const clustersWithIssues = useMemo<ClusterWithHealthIssues[]>(() => {
    return clusters
      .map((cluster, index) => {
        const deploymentStatus = clusterStatuses.find((c) => c.cluster_id === cluster.id)
        const runningStatus = runningStatusQueries[index]?.data
        const issues = getClusterHealthIssues({
          cluster,
          deploymentStatus,
          runningStatus,
          isRunningStatusIssueEnabled,
          hasRunningStatusTimedOut,
        })
        return { cluster, deploymentStatus, issues }
      })
      .filter((entry) => entry.issues.length > 0)
  }, [clusters, clusterStatuses, runningStatusQueries, isRunningStatusIssueEnabled, hasRunningStatusTimedOut])

  const issuesCount = clustersWithIssues.length
  const hasIssues = issuesCount > 0
  const severity = useMemo(() => {
    const kinds = clustersWithIssues.flatMap((entry) => entry.issues)
    return getClusterHealthIssuesSeverity(kinds)
  }, [clustersWithIssues])

  const groupedIssues = useMemo(() => {
    const groups = new Map<ClusterHealthIssueKind, ClusterWithHealthIssues[]>()
    for (const entry of clustersWithIssues) {
      for (const issue of entry.issues) {
        if (!groups.has(issue)) groups.set(issue, [])
        groups.get(issue)?.push(entry)
      }
    }
    return CLUSTER_HEALTH_ISSUE_ORDER.filter((kind) => groups.has(kind)).map((kind) => ({
      kind,
      entries: groups.get(kind) ?? [],
    }))
  }, [clustersWithIssues])

  const isUpdateOnlyState = hasOnlyAvailableUpdates(groupedIssues)

  const handleOpenIssuesModal = () => {
    openModal({
      options: { width: 676 },
      content: <ClusterProductionHealthIssuesModal groups={groupedIssues} count={issuesCount} onClose={closeModal} />,
    })
  }

  return (
    <>
      {isRunningStatusIssueEnabled &&
        clusters.map((cluster) => (
          <ClusterRunningStatusSubscription
            key={cluster.id}
            organizationId={cluster.organization.id}
            clusterId={cluster.id}
          />
        ))}
      {!isReady ? (
        <div className="flex w-full items-center gap-3 rounded-lg border border-neutral bg-background p-3">
          <Skeleton height={40} width={40} className="rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton height={14} width={96} />
            <Skeleton height={18} width={180} />
          </div>
        </div>
      ) : hasIssues ? (
        match(severity)
          .with('error', () => (
            <HealthStatusCard
              clusters={clusters}
              variant="negative"
              iconName="circle-exclamation"
              title={
                <>
                  {issuesCount} {pluralize(issuesCount, 'cluster', 'clusters')} with ongoing{' '}
                  {pluralize(issuesCount, 'issue', 'issues')}
                </>
              }
              onClick={handleOpenIssuesModal}
            />
          ))
          .otherwise(() => (
            <HealthStatusCard
              clusters={clusters}
              variant={isUpdateOnlyState ? 'brand' : 'warning'}
              iconName={isUpdateOnlyState ? 'rotate' : 'circle-exclamation'}
              title={getWarningTitle({ issuesCount, groupedIssues })}
              onClick={handleOpenIssuesModal}
            />
          ))
      ) : (
        <HealthStatusCard clusters={clusters} variant="positive" iconName="circle-check" title="All clusters healthy" />
      )}
    </>
  )
}

export default ClusterProductionHealthSummaryCard
