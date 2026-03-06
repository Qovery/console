import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { subHours } from 'date-fns'
import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type Database } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { Badge, Button, Callout, Chart, Heading, Icon, InputSelectSmall, Section, Tooltip } from '@qovery/shared/ui'
import { useContainerName } from '../../hooks/use-container-name/use-container-name'
import { useEnvironment } from '../../hooks/use-environment/use-environment'
import useHttpRouteName from '../../hooks/use-http-route-name/use-http-route-name'
import { useIngressName } from '../../hooks/use-ingress-name/use-ingress-name'
import { useNamespace } from '../../hooks/use-namespace/use-namespace'
import { usePodCount } from '../../hooks/use-pod-count/use-pod-count'
import { usePodNames } from '../../hooks/use-pod-names/use-pod-names'
import { DashboardProvider, type DashboardQueryParams, useDashboardContext } from '../../util-filter/dashboard-context'
import { CardHTTPErrors } from './card-http-errors/card-http-errors'
import { CardInstanceStatus } from './card-instance-status/card-instance-status'
import { CardLogErrors } from './card-log-errors/card-log-errors'
import { CardPercentile99 } from './card-percentile-99/card-percentile-99'
import { CardPrivateHTTPErrors } from './card-private-http-errors/card-private-http-errors'
import { CardPrivatePercentile99 } from './card-private-percentile-99/card-private-percentile-99'
import { CardStorage } from './card-storage/card-storage'
import { CpuChart } from './cpu-chart/cpu-chart'
import { DiskChart } from './disk-chart/disk-chart'
import { MemoryChart } from './memory-chart/memory-chart'
import { NetworkRequestDurationChart } from './network-request-duration-chart/network-request-duration-chart'
import { NetworkRequestSizeChart } from './network-request-size-chart/network-request-size-chart'
import { NetworkRequestStatusChart } from './network-request-status-chart/network-request-status-chart'
import { PrivateNetworkRequestDurationChart } from './private-network-request-duration-chart/private-network-request-duration-chart'
import { PrivateNetworkRequestSizeChart } from './private-network-request-size-chart/private-network-request-size-chart'
import { PrivateNetworkRequestStatusChart } from './private-network-request-status-chart/private-network-request-status-chart'
import { SelectTimeRange } from './select-time-range/select-time-range'

function ServiceDashboardContent({ environmentId, serviceId }: { environmentId: string; serviceId: string }) {
  const { data: service } = useService({ serviceId })
  const { data: environment } = useEnvironment({ environmentId })
  const {
    expandCharts,
    useLocalTime,
    setUseLocalTime,
    hideEvents,
    setHideEvents,
    setExpandCharts,
    isLiveUpdateEnabled,
    setIsLiveUpdateEnabled,
    handleTimeRangeChange,
    timeRange,
  } = useDashboardContext()

  const [resourcesMode, setResourcesMode] = useState<'pod' | 'aggregate' | null>(null)
  const [resourcesModeLoading, setResourcesModeLoading] = useState(true)

  const hasPublicPort =
    (service?.serviceType === 'APPLICATION' && (service?.ports || []).some((port) => port.publicly_accessible)) ||
    (service?.serviceType === 'CONTAINER' && (service?.ports || []).some((port) => port.publicly_accessible))

  const hasOnlyPrivatePorts =
    !hasPublicPort &&
    environment?.cloud_provider?.provider === 'AWS' &&
    ((service?.serviceType === 'APPLICATION' && (service?.ports || []).some((port) => !port.publicly_accessible)) ||
      (service?.serviceType === 'CONTAINER' && (service?.ports || []).some((port) => !port.publicly_accessible)))

  const hasStorage =
    service?.serviceType === 'DATABASE' ||
    ((service?.serviceType === 'CONTAINER' || service?.serviceType === 'APPLICATION') &&
      Array.isArray(service.storage) &&
      service.storage.length > 0)

  const now = new Date()
  const oneHourAgo = subHours(now, 1)

  const { data: containerName, isFetched: isFetchedContainerName } = useContainerName({
    clusterId: environment?.cluster_id ?? '',
    serviceId: serviceId,
    resourceType: hasStorage ? 'statefulset' : 'deployment',
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  // For container databases, retrieve pod names via kube_pod_owner
  const isContainerDatabase =
    service?.serviceType === 'DATABASE' && (service as Database)?.mode === DatabaseModeEnum.CONTAINER

  const { data: podNamesData, isFetched: isFetchedPodNames } = usePodNames({
    clusterId: environment?.cluster_id ?? '',
    statefulsetName: containerName ?? '',
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
    enabled: isContainerDatabase,
  })

  const podNames = isContainerDatabase && Array.isArray(podNamesData) ? podNamesData : []

  const { data: namespace, isFetched: isFetchedNamespace } = useNamespace({
    clusterId: environment?.cluster_id ?? '',
    serviceId: serviceId,
    resourceType: hasStorage ? 'statefulset' : 'deployment',
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const { data: ingressName = '' } = useIngressName({
    clusterId: environment?.cluster_id ?? '',
    serviceId: serviceId,
    enabled: hasPublicPort,
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const { data: httpRouteName = '' } = useHttpRouteName({
    clusterId: environment?.cluster_id ?? '',
    serviceId: serviceId,
    enabled: hasPublicPort,
    startDate: oneHourAgo.toISOString(),
    endDate: now.toISOString(),
  })

  const { podCount, isFetched: isFetchedPodCount } = usePodCount({
    clusterId: environment?.cluster_id ?? '',
    containerName: containerName ?? '',
    podNames: podNames.length > 0 ? podNames : undefined,
    enabled: !!containerName,
  })

  useEffect(() => {
    const resolved = isFetchedPodCount
    if (!resolved) {
      setResourcesModeLoading(true)
      return
    }
    const mode = podCount > 10 ? 'aggregate' : 'pod'
    setResourcesMode(mode)
    setResourcesModeLoading(false)
  }, [isFetchedPodCount, podCount])

  if ((!containerName && isFetchedContainerName) || (!namespace && isFetchedNamespace)) {
    return (
      <div className="h-full w-full p-5">
        <Callout.Root color="yellow" className="max-w-lg">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Monitoring service data is not available</Callout.TextHeading>
            <Callout.TextDescription className="flex flex-col gap-2">
              Please retry in a few seconds.
              <Button
                variant="surface"
                size="sm"
                className="max-w-fit"
                onClick={() => {
                  window.location.reload()
                }}
              >
                Reload page
              </Button>
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      </div>
    )
  }

  // For container databases, wait for podNames fetch to settle (even if empty)
  if (!environment || !service || !containerName || !namespace || (isContainerDatabase && !isFetchedPodNames))
    return (
      <div className="flex min-h-page-container w-full items-center justify-center p-5">
        <Chart.Loader />
      </div>
    )

  return (
    <div className="isolate">
      <div className="bg-surface sticky top-[45px] z-header h-14 w-full bg-background">
        <div className="mx-8 flex h-full items-center justify-between gap-3 border-b border-neutral">
          <div className="flex gap-2">
            <Tooltip
              content={
                <span>
                  Live refresh (15s) <br />
                  Only for time ranges ≤ 1h
                </span>
              }
            >
              <Button
                variant={isLiveUpdateEnabled ? 'solid' : 'surface'}
                color={isLiveUpdateEnabled ? 'brand' : 'neutral'}
                size="md"
                className={clsx('gap-1.5 pl-2.5', isLiveUpdateEnabled && 'border border-transparent')}
                onClick={() => {
                  // If timeRange is '30m' or greater, set to '15m' when enabling live update
                  if (!isLiveUpdateEnabled) {
                    if (timeRange !== '5m' && timeRange !== '15m' && timeRange !== '30m' && timeRange !== '1h') {
                      handleTimeRangeChange('15m')
                    }
                  }
                  setIsLiveUpdateEnabled(!isLiveUpdateEnabled)
                }}
              >
                <Icon iconName={isLiveUpdateEnabled ? 'circle-stop' : 'circle-play'} iconStyle="regular" />
                Live
              </Button>
            </Tooltip>
            <SelectTimeRange />
            <InputSelectSmall
              name="timezone"
              className="w-[120px] [&>i]:top-2"
              inputClassName="h-8"
              items={[
                { label: 'Local Time', value: 'local' },
                { label: 'UTC', value: 'utc' },
              ]}
              defaultValue={useLocalTime ? 'local' : 'utc'}
              onChange={(e) => setUseLocalTime(e === 'local')}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="plain"
              size="xs"
              className="flex items-center gap-1"
              onClick={() => setHideEvents(!hideEvents)}
            >
              {hideEvents ? 'Show events' : 'Hide events'}
              <Icon iconName={hideEvents ? 'eye' : 'eye-slash'} iconStyle="regular" />
            </Button>
            <Button
              variant="plain"
              size="xs"
              className="flex items-center gap-1"
              onClick={() => setExpandCharts(!expandCharts)}
            >
              {expandCharts ? 'Collapse charts' : 'Expand charts'}
              <Icon iconName={expandCharts ? 'arrows-minimize' : 'arrows-maximize'} iconStyle="light" />
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-10 px-8 py-10">
        <Section className="gap-4">
          <Heading weight="medium">Service health check</Heading>
          <div className={clsx('grid h-full gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
            <CardInstanceStatus
              clusterId={environment.cluster_id}
              serviceId={serviceId}
              containerName={containerName}
              namespace={namespace}
              podNames={podNames}
            />
            <div className="flex h-full flex-col gap-3">
              <CardLogErrors
                organizationId={environment.organization.id}
                projectId={environment.project.id}
                environmentId={environment.id}
                serviceId={serviceId}
                clusterId={environment.cluster_id}
                containerName={containerName}
              />
              {hasPublicPort && (
                <CardHTTPErrors
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  containerName={containerName}
                  ingressName={ingressName}
                  httpRouteName={httpRouteName}
                />
              )}
              {hasOnlyPrivatePorts && (
                <CardPrivateHTTPErrors
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  containerName={containerName}
                />
              )}
              {hasStorage && <CardStorage clusterId={environment.cluster_id} serviceId={serviceId} />}
              {hasPublicPort && (
                <CardPercentile99
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  ingressName={ingressName}
                  httpRouteName={httpRouteName}
                />
              )}
              {hasOnlyPrivatePorts && (
                <CardPrivatePercentile99
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  containerName={containerName}
                />
              )}
            </div>
          </div>
        </Section>
        <Section className="gap-4">
          <div className="flex items-center justify-between gap-2">
            <Heading weight="medium">Resources</Heading>
            {!resourcesModeLoading && resourcesMode && (
              <Tooltip
                content={
                  resourcesMode === 'aggregate'
                    ? 'Used when more than 10 pods are displayed. Zoom in to see pod-level metrics'
                    : 'Showing metrics for individual pods. Aggregated view is available when more than 10 pods are displayed'
                }
              >
                <Badge
                  variant="surface"
                  color={resourcesMode === 'aggregate' ? 'sky' : 'purple'}
                  radius="full"
                  size="sm"
                  className="h-6 gap-1 text-ssm"
                >
                  <Icon iconName="circle-info" iconStyle="regular" className="text-ssm" />
                  <span className="font-medium">
                    {resourcesMode === 'aggregate' ? 'Aggregated view' : 'Pod-level view'}
                  </span>
                </Badge>
              </Tooltip>
            )}
          </div>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <CpuChart
                clusterId={environment.cluster_id}
                serviceId={serviceId}
                containerName={containerName}
                podNames={podNames}
                podCountData={{ podCount, isResolved: isFetchedPodCount }}
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <MemoryChart
                clusterId={environment.cluster_id}
                serviceId={serviceId}
                containerName={containerName}
                podNames={podNames}
                podCountData={{ podCount, isResolved: isFetchedPodCount }}
              />
            </div>
            {hasStorage && (
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                <DiskChart
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  containerName={containerName}
                  podNames={podNames}
                />
              </div>
            )}
          </div>
        </Section>
        {hasPublicPort && (
          <Section className="gap-4">
            <Heading weight="medium">Network</Heading>
            <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                <NetworkRequestStatusChart
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  ingressName={ingressName}
                  httpRouteName={httpRouteName}
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                <NetworkRequestDurationChart
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  ingressName={ingressName}
                  httpRouteName={httpRouteName}
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                <NetworkRequestSizeChart
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  ingressName={ingressName}
                  httpRouteName={httpRouteName}
                />
              </div>
            </div>
          </Section>
        )}
        {hasOnlyPrivatePorts && (
          <Section className="gap-4">
            <Heading weight="medium">Network</Heading>
            <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                <PrivateNetworkRequestStatusChart
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  containerName={containerName}
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                <PrivateNetworkRequestDurationChart
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  containerName={containerName}
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                <PrivateNetworkRequestSizeChart
                  clusterId={environment.cluster_id}
                  serviceId={serviceId}
                  containerName={containerName}
                />
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

export interface ServiceDashboardProps {
  queryParams?: DashboardQueryParams
  setQueryParams?: (updates: Partial<DashboardQueryParams>) => void
}

export function ServiceDashboard({ queryParams, setQueryParams }: ServiceDashboardProps) {
  const { organizationId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  return (
    <DashboardProvider organizationId={organizationId} queryParams={queryParams} setQueryParams={setQueryParams}>
      <ServiceDashboardContent environmentId={environmentId} serviceId={serviceId} />
    </DashboardProvider>
  )
}

export default ServiceDashboard
