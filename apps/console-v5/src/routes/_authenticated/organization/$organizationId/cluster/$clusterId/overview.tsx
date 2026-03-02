import { createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useContext } from 'react'
import {
  ClusterCardNodeUsage,
  ClusterTableNode,
  ClusterTableNodepool,
  useClusterMetrics,
  useClusterMetricsSocket,
} from '@qovery/domains/cluster-metrics/feature'
import { ClusterCardResources } from '@qovery/domains/cluster-metrics/feature'
import { ClusterCardSetup } from '@qovery/domains/cluster-metrics/feature'
import {
  ClusterActionToolbar,
  ClusterAvatar,
  ClusterNeedRedeployFlag,
  ClusterTerminal,
  ClusterTerminalContext,
  ClusterTerminalProvider,
  ClusterType,
  hasGpuInstance,
  useCluster,
  useClusterRunningStatus,
  useClusterRunningStatusSocket,
  useClusterStatus,
  useDeployCluster,
} from '@qovery/domains/clusters/feature'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, ErrorBoundary, Heading, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

type OverviewSearch = {
  hasShell?: boolean
}

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/overview')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): OverviewSearch => ({
    hasShell: search.hasShell === 'true' || search.hasShell === true,
  }),
})

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
      <div className="flex divide-x divide-neutral border-b border-neutral">
        <div className="h-8 w-1/4 bg-surface-neutral"></div>
        <div className="h-8 w-1/4 bg-surface-neutral"></div>
        <div className="h-8 w-1/4 bg-surface-neutral"></div>
        <div className="h-8 w-[calc(35%/3)] bg-surface-neutral"></div>
        <div className="h-8 w-[calc(20%/3)] bg-surface-neutral"></div>
        <div className="h-8 w-[calc(20%/3)] bg-surface-neutral"></div>
      </div>

      <div className="divide-y divide-neutral">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="flex divide-x divide-neutral">
            <div className="flex h-12 w-1/4 items-center gap-2 px-5">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-1/4 items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-1/4 items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-[calc(35%/3)] items-center gap-2 px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-[calc(20%/3)] items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
            <div className="flex h-12 w-[calc(20%/3)] items-center px-3">
              <Skeleton width={80} height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TableLegend() {
  return (
    <div className="flex w-full items-center justify-end gap-1.5 text-xs text-neutral">
      <span className="block h-2 w-2 bg-brand-9"></span>
      <span className="flex items-center gap-1">
        Reserved
        <Tooltip content="Reserved CPU or memory represents the amount of resource guaranteed for this workload.">
          <span className="relative top-[1px] text-neutral-subtle">
            <Icon iconName="circle-question" iconStyle="regular" />
          </span>
        </Tooltip>
      </span>
    </div>
  )
}

function ClusterOverview({ organizationId, clusterId }: { organizationId: string; clusterId: string }) {
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { mutate: deployCluster } = useDeployCluster()
  const { data: runningStatus } = useClusterRunningStatus({ organizationId, clusterId })
  const { data: clusterMetrics } = useClusterMetrics({ organizationId, clusterId })
  const { data: clusterStatus, isLoading: isClusterStatusLoading } = useClusterStatus({
    organizationId,
    clusterId,
    refetchInterval: 4_000,
    enabled: Boolean(organizationId) && Boolean(clusterId),
  })

  const { open } = useContext(ClusterTerminalContext)

  const isLoading = isClusterLoading || isClusterStatusLoading || !runningStatus || !clusterMetrics

  const isKarpenter = cluster?.features?.find((feature) => feature.id === 'KARPENTER')

  if (typeof runningStatus === 'string') {
    return (
      <div className="mt-6 h-80 p-8">
        <div className="flex h-full flex-col items-center justify-center gap-1 rounded border border-neutral bg-surface-neutral py-10 text-sm text-neutral">
          <Icon className="text-xl text-neutral-subtle" iconName="circle-info" iconStyle="regular" />
          <span className="font-medium">No metrics available because the running status is unavailable.</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {cluster && cluster.deployment_status !== ClusterDeploymentStatusEnum.UP_TO_DATE && (
        <ClusterNeedRedeployFlag
          deploymentStatus={cluster.deployment_status}
          onClickButton={() =>
            deployCluster({
              organizationId,
              clusterId,
            })
          }
        />
      )}
      <Section className="my-6 gap-6 pb-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex items-center gap-2">
              <Skeleton width={40} height={40} show={!cluster} rounded>
                <ClusterAvatar cluster={cluster} />
              </Skeleton>
              <Skeleton width={160} height={22} show={!cluster}>
                <Heading>{cluster?.name}</Heading>
              </Skeleton>
            </div>
            <div className="hidden h-4 w-0 border-r border-neutral lg:block" />
            <div className="flex flex-wrap items-center gap-2">
              {cluster?.production && (
                <Badge variant="surface" color="red">
                  Production
                </Badge>
              )}
              {cluster?.is_default && <Badge color="sky">Default</Badge>}
              {cluster ? (
                cluster.kubernetes === 'SELF_MANAGED' ? (
                  <Badge color="neutral">
                    <Icon name={IconEnum.KUBERNETES} height={16} width={16} className="mr-1" />
                    Self managed
                  </Badge>
                ) : (
                  <>
                    <Badge color="neutral">
                      <Icon name={IconEnum.QOVERY} height={16} width={16} className="mr-1" />
                      Qovery managed
                    </Badge>
                    <ClusterType
                      cloudProvider={cluster.cloud_provider}
                      kubernetes={cluster.kubernetes}
                      instanceType={cluster.instance_type}
                    />
                  </>
                )
              ) : (
                <Skeleton width={120} height={22} show />
              )}
              {cluster?.region !== 'on-premise' && cluster?.kubernetes !== 'PARTIALLY_MANAGED' && (
                <Skeleton width={120} height={22} show={!cluster}>
                  <Badge color="neutral" variant="surface">
                    {cluster?.region}
                  </Badge>
                </Skeleton>
              )}
              {cluster?.kubernetes !== 'SELF_MANAGED' && (
                <>
                  <Skeleton width={120} height={22} show={!cluster}>
                    {cluster?.version && (
                      <Badge color="neutral" variant="surface">
                        {cluster?.version}
                      </Badge>
                    )}
                  </Skeleton>
                  {cluster?.instance_type &&
                    cluster.kubernetes !== 'PARTIALLY_MANAGED' &&
                    cluster?.instance_type !== 'KARPENTER' && (
                      <Skeleton width={120} height={22} show={!cluster}>
                        <Badge color="neutral" variant="surface">
                          {cluster?.instance_type?.toLowerCase().replace('_', '.')}
                        </Badge>
                      </Skeleton>
                    )}
                </>
              )}
              {hasGpuInstance(cluster) && (
                <Badge color="neutral" variant="surface">
                  GPU pool
                </Badge>
              )}
            </div>
            <div className="order-last flex w-full lg:order-none lg:ml-auto lg:w-auto">
              <Skeleton width={150} height={36} show={!cluster && !clusterStatus}>
                {cluster && clusterStatus ? (
                  <ClusterActionToolbar cluster={cluster} clusterStatus={clusterStatus} />
                ) : (
                  <div />
                )}
              </Skeleton>
            </div>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <ClusterCardNodeUsage organizationId={organizationId} clusterId={clusterId} />
          <ClusterCardResources organizationId={organizationId} clusterId={clusterId} />
          <ClusterCardSetup organizationId={organizationId} clusterId={clusterId} />
        </div>
        {isLoading ? (
          <TableSkeleton />
        ) : isKarpenter ? (
          <div className="flex flex-col gap-4">
            <TableLegend />
            <ClusterTableNodepool organizationId={organizationId} clusterId={clusterId} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <TableLegend />
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <ClusterTableNode organizationId={organizationId} clusterId={clusterId} className="border-0" />
            </div>
          </div>
        )}
      </Section>
      {open && cluster && <ClusterTerminal organizationId={cluster.organization.id} clusterId={cluster.id} />}
    </>
  )
}

function RouteComponent() {
  useDocumentTitle('Cluster - Overview')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

  useClusterRunningStatusSocket({ organizationId, clusterId })
  useClusterMetricsSocket({ organizationId, clusterId })

  if (!organizationId || !clusterId) {
    return null
  }

  return (
    <ClusterTerminalProvider>
      <ErrorBoundary>
        <ClusterOverview organizationId={organizationId} clusterId={clusterId} />
      </ErrorBoundary>
    </ClusterTerminalProvider>
  )
}
