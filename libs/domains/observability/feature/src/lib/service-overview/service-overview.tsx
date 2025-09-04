import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import { Button, Heading, Icon, InputSelectSmall, Section, Tooltip } from '@qovery/shared/ui'
import { useContainerName } from '../hooks/use-container-name/use-container-name'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import useIngressName from '../hooks/use-ingress-name/use-ingress-name'
import { CardHTTPErrors } from './card-http-errors/card-http-errors'
import { CardInstanceStatus } from './card-instance-status/card-instance-status'
import { CardLogErrors } from './card-log-errors/card-log-errors'
import { CardPercentile99 } from './card-percentile-99/card-percentile-99'
import { CardStorage } from './card-storage/card-storage'
import { CpuChart } from './cpu-chart/cpu-chart'
import { DiskChart } from './disk-chart/disk-chart'
import { MemoryChart } from './memory-chart/memory-chart'
import { NetworkRequestDurationChart } from './network-request-duration-chart/network-request-duration-chart'
import { NetworkRequestSizeChart } from './network-request-size-chart/network-request-size-chart'
import { NetworkRequestStatusChart } from './network-request-status-chart/network-request-status-chart'
import { SelectTimeRange } from './select-time-range/select-time-range'
import { ServiceOverviewProvider, useServiceOverviewContext } from './util-filter/service-overview-context'

function ServiceOverviewContent() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId })
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
  } = useServiceOverviewContext()

  const hasPublicPort =
    (service?.serviceType === 'APPLICATION' && (service?.ports || []).some((port) => port.publicly_accessible)) ||
    (service?.serviceType === 'CONTAINER' && (service?.ports || []).some((port) => port.publicly_accessible))

  const hasStorage = service?.serviceType === 'CONTAINER' && (service.storage || []).length > 0

  const { data: containerName } = useContainerName({
    clusterId: environment?.cluster_id ?? '',
    serviceId: applicationId,
    resourceType: hasStorage ? 'statefulset' : 'deployment',
  })

  const { data: ingressName } = useIngressName({
    clusterId: environment?.cluster_id ?? '',
    serviceId: applicationId,
    enabled: hasPublicPort,
  })

  if (!environment || !service || !containerName || !ingressName) return null

  return (
    <div className="isolate">
      <div className="sticky top-16 z-10 flex h-[68px] w-full items-center justify-between gap-3 border-b border-neutral-250 bg-white px-8">
        <div className="flex gap-3">
          <Tooltip content="Live refresh (15s)">
            <Button
              variant={isLiveUpdateEnabled ? 'solid' : 'surface'}
              color={isLiveUpdateEnabled ? 'brand' : 'neutral'}
              size="md"
              className={clsx('gap-1.5', isLiveUpdateEnabled && 'border border-transparent')}
              onClick={() => setIsLiveUpdateEnabled(!isLiveUpdateEnabled)}
            >
              <Icon
                iconName={isLiveUpdateEnabled ? 'circle-stop' : 'circle-play'}
                iconStyle="regular"
                className="relative top-[1px]"
              />
              Live
            </Button>
          </Tooltip>
          <SelectTimeRange />
          <InputSelectSmall
            name="timezone"
            className="w-[120px]"
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
      <div className="space-y-10 px-8 py-10">
        <Section className="gap-4">
          <Heading weight="medium">Service health check</Heading>
          <div className={clsx('grid h-full gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 xl:grid-cols-2')}>
            <CardInstanceStatus
              clusterId={environment.cluster_id}
              serviceId={applicationId}
              containerName={containerName}
            />
            <div className="flex h-full flex-col gap-3">
              <CardLogErrors
                organizationId={environment.organization.id}
                projectId={environment.project.id}
                environmentId={environment.id}
                serviceId={applicationId}
                clusterId={environment.cluster_id}
                containerName={containerName}
              />
              {hasPublicPort && (
                <CardHTTPErrors
                  clusterId={environment.cluster_id}
                  serviceId={applicationId}
                  containerName={containerName}
                  ingressName={ingressName}
                />
              )}
              {hasStorage && <CardStorage clusterId={environment.cluster_id} serviceId={applicationId} />}
              {hasPublicPort && (
                <CardPercentile99
                  clusterId={environment.cluster_id}
                  serviceId={applicationId}
                  containerName={containerName}
                  ingressName={ingressName}
                />
              )}
            </div>
          </div>
        </Section>
        <Section className="gap-4">
          <Heading weight="medium">Resources</Heading>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2')}>
            <div className="overflow-hidden rounded border border-neutral-250">
              <CpuChart clusterId={environment.cluster_id} serviceId={applicationId} containerName={containerName} />
            </div>
            <div className="overflow-hidden rounded border border-neutral-250">
              <MemoryChart clusterId={environment.cluster_id} serviceId={applicationId} containerName={containerName} />
            </div>
            {hasStorage && (
              <div className="overflow-hidden rounded border border-neutral-250">
                <DiskChart clusterId={environment.cluster_id} serviceId={applicationId} containerName={containerName} />
              </div>
            )}
          </div>
        </Section>
        {hasPublicPort && (
          <Section className="gap-4">
            <Heading weight="medium">Network</Heading>
            <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2')}>
              <div className="overflow-hidden rounded border border-neutral-250">
                <NetworkRequestStatusChart
                  clusterId={environment.cluster_id}
                  serviceId={applicationId}
                  containerName={containerName}
                  ingressName={ingressName}
                />
              </div>
              <div className="overflow-hidden rounded border border-neutral-250">
                <NetworkRequestDurationChart
                  clusterId={environment.cluster_id}
                  serviceId={applicationId}
                  containerName={containerName}
                  ingressName={ingressName}
                />
              </div>
              <div className="overflow-hidden rounded border border-neutral-250">
                <NetworkRequestSizeChart
                  clusterId={environment.cluster_id}
                  serviceId={applicationId}
                  containerName={containerName}
                  ingressName={ingressName}
                />
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

export function ServiceOverview() {
  return (
    <ServiceOverviewProvider>
      <ServiceOverviewContent />
    </ServiceOverviewProvider>
  )
}

export default ServiceOverview
