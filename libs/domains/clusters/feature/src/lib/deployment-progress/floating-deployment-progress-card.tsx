import clsx from 'clsx'
import { useState } from 'react'
import { useProjects } from '@qovery/domains/projects/feature'
import { INFRA_LOGS_URL, OVERVIEW_URL } from '@qovery/shared/routes'
import { Icon, Link } from '@qovery/shared/ui'
import { AnimatedGradientText } from '@qovery/shared/ui'
import { useDeploymentProgress } from '../hooks/use-deployment-progress/use-deployment-progress'

export interface FloatingDeploymentProgressCardProps {
  organizationId: string
  clusters: { id: string; name?: string; cloud_provider?: string }[]
}

function ClusterRow({
  organizationId,
  clusterId,
  clusterName,
  cloudProvider,
  isSingle,
  isFirst,
  isLast,
}: {
  organizationId: string
  clusterId: string
  clusterName?: string
  cloudProvider?: string
  isSingle: boolean
  isFirst: boolean
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const { steps, progressValue, currentStepLabel, state } = useDeploymentProgress({
    organizationId,
    clusterId,
    clusterName,
    cloudProvider,
  })
  const { data: projects = [] } = useProjects({ organizationId, enabled: !!organizationId })
  const projectTarget = state === 'succeeded' ? projects[0] : undefined

  const rowClasses = isSingle ? '' : clsx(!isLast && 'border-b border-neutral-200')

  const containerClasses = isSingle ? 'rounded-xl' : ''
  const isInstalling = state === 'installing'
  const isFailed = state === 'failed'
  const isSucceeded = state === 'succeeded'
  const isDone = isFailed || isSucceeded
  const targetLink = isFailed
    ? INFRA_LOGS_URL(organizationId, clusterId)
    : projectTarget
      ? OVERVIEW_URL(organizationId, projectTarget.id)
      : undefined
  const targetLabel = isFailed ? 'See logs' : projectTarget ? 'Start deploying' : undefined

  return (
    <div className={rowClasses}>
      <div
        className={`${containerClasses} relative z-10 flex w-full items-center justify-between gap-4 overflow-hidden bg-white p-4 text-sm shadow-sm`}
      >
        <div className="flex shrink-0 items-center gap-2 text-neutral-400">
          {isSucceeded && <Icon iconName="check-circle" iconStyle="regular" className="text-green-500" />}
          {isFailed && <Icon iconName="circle-xmark" iconStyle="regular" className="text-red-500" />}
          {isInstalling && (
            <span aria-hidden="true" className="inline-flex h-[14px] w-[14px] items-center justify-center">
              <svg className="-rotate-90" width="14" height="14" viewBox="0 0 14 14" role="presentation">
                <circle cx="7" cy="7" r={6.25} stroke="#E5E7EB" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                <circle
                  cx="7"
                  cy="7"
                  r={6.25}
                  stroke="#5A4BFF"
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 6.25}
                  strokeDashoffset={2 * Math.PI * 6.25 * (1 - progressValue)}
                  className="transition-[stroke-dashoffset] duration-300 ease-out"
                />
              </svg>
            </span>
          )}
          {!isSucceeded && !isFailed && !isInstalling && (
            <Icon iconName="clock" iconStyle="regular" className="text-neutral-350" />
          )}
          <span className="truncate">
            {clusterName ?? 'Cluster'} {isFailed ? 'creation failed' : isSucceeded ? 'created' : ''}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {targetLink && targetLabel && (
            <Link to={targetLink} size="ssm" color="current" className="text-neutral-350 hover:text-neutral-400">
              {targetLabel}
              <Icon iconName="chevron-right" iconStyle="regular" />
            </Link>
          )}
          {isInstalling && (
            <button
              type="button"
              className="flex min-w-0 items-center gap-2 text-ssm text-neutral-350 hover:text-neutral-400"
              onClick={() => setExpanded((prev) => !prev)}
            >
              <span className="min-w-0 overflow-hidden">
                <AnimatedGradientText className="block w-full truncate from-neutral-300 via-neutral-350 to-neutral-300 text-left">
                  {currentStepLabel}
                </AnimatedGradientText>
              </span>
              <span aria-hidden="true">&nbsp;</span>
              <Icon iconName={expanded ? 'chevron-up' : 'chevron-down'} iconStyle="regular" />
            </button>
          )}
          {!isSucceeded && !isFailed && !isInstalling && <p className="text-ssm text-neutral-350">Deployment queued</p>}
        </div>
      </div>
      {expanded && !isDone && (
        <div className="bg-neutral-100 px-4 py-3 text-ssm">
          <ul className="flex flex-col gap-2">
            {steps.map(({ label, status }) => (
              <li key={label} className="flex items-center gap-2">
                {status === 'done' && <Icon iconName="check-circle" iconStyle="regular" className="text-neutral-350" />}
                {status === 'current' && (
                  <Icon iconName="loader" iconStyle="regular" className="animate-spin text-neutral-400" />
                )}
                {status === 'pending' && <Icon iconName="circle" iconStyle="regular" className="text-neutral-300" />}
                <span
                  className={
                    status === 'done'
                      ? 'text-neutral-350'
                      : status === 'current'
                        ? 'text-neutral-400'
                        : 'text-neutral-300'
                  }
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function FloatingDeploymentProgressCard({ organizationId, clusters }: FloatingDeploymentProgressCardProps) {
  if (!clusters.length) return null
  const isSingle = clusters.length === 1

  return (
    <div className="fixed bottom-[80px] right-4 w-96 max-w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-md">
      {clusters.map((cluster, idx) => (
        <ClusterRow
          key={cluster.id}
          organizationId={organizationId}
          clusterId={cluster.id}
          clusterName={cluster.name}
          cloudProvider={cluster.cloud_provider}
          isSingle={isSingle}
          isFirst={idx === 0}
          isLast={idx === clusters.length - 1}
        />
      ))}
    </div>
  )
}

export default FloatingDeploymentProgressCard
