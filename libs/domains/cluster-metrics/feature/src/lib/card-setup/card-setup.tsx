import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster, useClusterRunningStatus, useClusterStatus } from '@qovery/domains/clusters/feature'
import { INFRA_LOGS_URL } from '@qovery/shared/routes'
import { Badge, Icon, Skeleton, StatusChip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'

export interface CardSetupProps {
  organizationId: string
  clusterId: string
}

export function CardSetup({ organizationId, clusterId }: CardSetupProps) {
  const { data: cluster } = useCluster({ organizationId, clusterId })

  const { data: deploymentStatus } = useClusterStatus({ organizationId, clusterId, refetchInterval: 5000 })
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })
  const kubeVersion = runningStatus?.computed_status?.kube_version_status

  const isLoading =
    !deploymentStatus?.is_deployed || !deploymentStatus?.last_deployment_date || !cluster?.created_at || !kubeVersion

  return (
    <div className="flex flex-col gap-2.5 rounded border border-neutral-250 p-4">
      <p className="text-sm text-neutral-350">Cluster setup</p>
      <div
        className={clsx('flex flex-col text-sm text-neutral-400', {
          'mt-1 gap-3': isLoading,
        })}
      >
        <Skeleton width="65%" height={20} show={isLoading}>
          <div className="flex h-8 items-center p-1.5">
            <span className="flex items-center gap-2">
              {kubeVersion &&
                match(kubeVersion)
                  .with({ type: 'OK' }, (status) => (
                    <>
                      <StatusChip status="RUNNING" />
                      Kubernetes up to date
                      <Badge variant="surface" size="sm">
                        {status.kube_version}
                      </Badge>
                    </>
                  ))
                  .with({ type: 'DRIFT' }, (status) => (
                    <>
                      <StatusChip status="WARNING" />
                      Upgrade Kubernetes
                      <Badge color="yellow" size="sm" variant="surface">
                        {status.kube_version} → {status.expected_kube_version}
                      </Badge>
                    </>
                  ))
                  .with({ type: 'UNKNOWN' }, () => (
                    <>
                      <StatusChip status="ERROR" />
                      Kubernetes version{' '}
                      <Badge color="red" size="sm" variant="surface">
                        Unsupported
                      </Badge>
                    </>
                  ))
                  .exhaustive()}
            </span>
          </div>
        </Skeleton>
        <Skeleton width="65%" height={20} show={isLoading}>
          <Link
            to={INFRA_LOGS_URL(organizationId, clusterId)}
            className="flex h-8 w-full items-center gap-2.5 rounded p-1.5 transition-colors hover:bg-neutral-150"
          >
            <StatusChip status="RUNNING" />
            Deployed{' '}
            {deploymentStatus?.last_deployment_date && timeAgo(new Date(deploymentStatus.last_deployment_date))}
            <Icon className="ml-auto text-base text-neutral-300" iconName="arrow-up-right" iconStyle="regular" />
          </Link>
        </Skeleton>
        <Skeleton width="65%" height={20} show={isLoading}>
          <div className="flex h-8 items-center gap-2.5 p-1.5">
            <Icon className="text-base text-neutral-300" iconName="calendar-day" iconStyle="regular" />
            Created {cluster?.created_at && timeAgo(new Date(cluster.created_at))}
          </div>
        </Skeleton>
      </div>
    </div>
  )
}

export default CardSetup
