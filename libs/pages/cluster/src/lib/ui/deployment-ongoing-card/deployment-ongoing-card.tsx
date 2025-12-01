import { useLocation } from 'react-router-dom'
import { useDeploymentProgress } from '@qovery/domains/clusters/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { INFRA_LOGS_URL } from '@qovery/shared/routes'
import { OVERVIEW_URL } from '@qovery/shared/routes'
import { Icon, Link } from '@qovery/shared/ui'

export interface DeploymentOngoingCardProps {
  organizationId: string
  clusterId: string
  clusterName?: string
  cloudProvider?: string
}

export function DeploymentOngoingCard({
  organizationId,
  clusterId,
  clusterName,
  cloudProvider,
}: DeploymentOngoingCardProps) {
  const { pathname } = useLocation()
  const { data: projects = [] } = useProjects({ organizationId, enabled: !!organizationId })
  const { steps, installationComplete, progressValue, creationFailed } = useDeploymentProgress({
    organizationId,
    clusterId,
    clusterName,
    cloudProvider,
  })

  const deploymentLink =
    creationFailed || !projects[0]
      ? INFRA_LOGS_URL(organizationId, clusterId)
      : installationComplete
        ? OVERVIEW_URL(organizationId, projects[0].id)
        : INFRA_LOGS_URL(organizationId, clusterId)
  const deploymentLinkLabel = creationFailed
    ? 'See logs'
    : installationComplete && projects[0]
      ? 'Start deploying'
      : 'Cluster logs'

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-b border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
          {creationFailed ? (
            <>
              <Icon iconName="circle-xmark" iconStyle="regular" className="text-red-500" />
              Cluster install failed
            </>
          ) : installationComplete ? (
            <>
              <Icon iconName="check-circle" iconStyle="regular" className="text-green-500" />
              Cluster installed!
            </>
          ) : (
            <>
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
                    className="transition-[stroke-dashoffset] duration-150 ease-in-out"
                  />
                </svg>
              </span>
              Deployment ongoing
            </>
          )}
        </div>
        <div className="text-neutral-350">
          <Link to={deploymentLink} state={{ prevUrl: pathname }} size="ssm" color="current">
            {deploymentLinkLabel}
            <Icon iconName="chevron-right" iconStyle="regular" />
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 p-4 text-ssm" role="list">
        {steps.map(({ label, status }: { label: string; status: 'current' | 'pending' | 'done' }, index: number) => (
          <div key={label} className="flex items-center" role="listitem">
            {status === 'done' && (
              <Icon iconName="check-circle" iconStyle="regular" className="mr-2 text-ssm text-neutral-350" />
            )}
            {status === 'current' && (
              <Icon iconName="loader" iconStyle="regular" className="mr-2 animate-spin text-ssm text-neutral-400" />
            )}
            {status === 'pending' && (
              <Icon iconName="circle" iconStyle="regular" className="mr-2 text-ssm text-neutral-300" />
            )}
            <span
              className={
                status === 'done'
                  ? 'mr-3 text-neutral-350'
                  : status === 'current'
                    ? 'mr-3 text-neutral-400'
                    : 'mr-3 text-neutral-300'
              }
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span className={status === 'done' ? 'text-neutral-350' : 'text-neutral-300'} aria-hidden>
                ⸺
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeploymentOngoingCard
