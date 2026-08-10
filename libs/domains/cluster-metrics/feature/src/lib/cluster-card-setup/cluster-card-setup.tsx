import clsx from 'clsx'
import { match } from 'ts-pattern'
import { useCluster, useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { Badge, ExternalLink, Icon, Skeleton, StatusChip } from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'

export interface ClusterCardSetupProps {
  organizationId: string
  clusterId: string
}

export function ClusterCardSetup({ organizationId, clusterId }: ClusterCardSetupProps) {
  const { data: cluster } = useCluster({ organizationId, clusterId })

  const { data: runningStatus } = useClusterRunningStatus({
    organizationId: organizationId,
    clusterId: clusterId,
  })

  const kubeVersion = runningStatus?.computed_status?.kube_version_status
  const isEksAnywhereCluster = cluster?.kubernetes === 'PARTIALLY_MANAGED'

  const isLoading = !cluster?.created_at || !kubeVersion

  return (
    <div className="flex flex-col gap-2.5 rounded border border-neutral bg-surface-neutral p-4">
      <p className="text-sm text-neutral-subtle">Cluster setup</p>
      <div
        className={clsx('flex flex-col text-sm text-neutral', {
          'mt-1 gap-3': isLoading,
        })}
      >
        <Skeleton width="65%" height={20} show={isLoading}>
          <div className="flex h-8 items-center p-1.5">
            <span className="flex items-center gap-2.5">
              {kubeVersion &&
                match(kubeVersion)
                  .with({ type: 'OK' }, (status) => (
                    <>
                      <span className="flex w-5 shrink-0 justify-center">
                        <StatusChip status="RUNNING" />
                      </span>
                      Kubernetes up to date
                      <Badge variant="surface" size="sm">
                        {status.kube_version}
                      </Badge>
                    </>
                  ))
                  .with({ type: 'DRIFT' }, (status) => (
                    <>
                      {isEksAnywhereCluster ? (
                        <>
                          <span className="flex w-5 shrink-0 justify-center">
                            <StatusChip status="RUNNING" />
                          </span>
                          Kubernetes version
                          <Badge variant="surface" size="sm">
                            {status.kube_version}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <span className="flex w-5 shrink-0 justify-center">
                            <StatusChip status="WARNING" />
                          </span>
                          Upgrade Kubernetes
                          <Badge color="yellow" size="sm" variant="surface">
                            {!status.expected_kube_version
                              ? status.kube_version
                              : `${status.kube_version} → ${status.expected_kube_version}`}
                          </Badge>
                        </>
                      )}
                    </>
                  ))
                  .with({ type: 'UNKNOWN' }, () => (
                    <>
                      <span className="flex w-5 shrink-0 justify-center">
                        <StatusChip status="ERROR" />
                      </span>
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
        {cluster?.cloud_provider !== 'ON_PREMISE' && (
          <Skeleton width="65%" height={20} show={isLoading} className="truncate">
            <ExternalLink
              href="https://www.qovery.com/docs/configuration/clusters#faq"
              color="neutral"
              withIcon={false}
              className="flex h-8 w-full items-center gap-2.5 rounded p-1.5 font-normal transition-colors hover:bg-surface-neutral-componentHover hover:text-neutral"
            >
              <span className="flex w-5 shrink-0 justify-center">
                <Icon className="text-base text-neutral-subtle" iconName="wrench" iconStyle="regular" />
              </span>
              Maintenance every {cluster?.production ? 'Wednesday' : 'Monday'}
              <Icon className="ml-auto text-base text-neutral-subtle" iconName="arrow-up-right" iconStyle="regular" />
            </ExternalLink>
          </Skeleton>
        )}
        <Skeleton width="65%" height={20} show={isLoading}>
          <div
            title={cluster?.created_at ? dateUTCString(cluster.created_at) : undefined}
            className="flex h-8 items-center gap-2.5 p-1.5"
          >
            <span className="flex w-5 shrink-0 justify-center">
              <Icon className="text-base text-neutral-subtle" iconName="calendar-day" iconStyle="regular" />
            </span>
            Created {cluster?.created_at && timeAgo(new Date(cluster.created_at))} ago
          </div>
        </Skeleton>
      </div>
    </div>
  )
}

export default ClusterCardSetup
