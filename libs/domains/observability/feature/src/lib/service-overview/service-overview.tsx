import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import clsx from 'clsx'
import { type PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import { Button, Icon, InputSelectSmall, Section, SegmentedControl } from '@qovery/shared/ui'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { CardHTTPErrors } from './card-http-errors/card-http-errors'
import { CardInstanceStatus } from './card-instance-status/card-instance-status'
import { CardInstance } from './card-instance/card-instance'
import { CardLogErrors } from './card-log-errors/card-log-errors'
import { CardPercentile50 } from './card-percentile-50/card-percentile-50'
import { CardPercentile95 } from './card-percentile-95/card-percentile-95'
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

type View = 'monitoring' | 'instance'
type ChartView = 'global' | 'network'

function ServiceOverviewContent({ children }: PropsWithChildren) {
  const { environmentId = '', applicationId = '' } = useParams()
  const [view, setView] = useState<View>('monitoring')
  const [chartView, setChartView] = useState<ChartView>('global')

  const { data: service } = useService({ serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId })
  const { expandCharts, useLocalTime, setUseLocalTime, hideEvents, setHideEvents, setExpandCharts } =
    useServiceOverviewContext()

  if (!environment || !service) return null

  const hasPublicPort =
    (service.serviceType === 'APPLICATION' && (service?.ports || []).some((port) => port.publicly_accessible)) ||
    (service.serviceType === 'CONTAINER' && (service?.ports || []).some((port) => port.publicly_accessible))

  const hasStorage = service.serviceType === 'CONTAINER' && (service.storage || []).length > 0

  return (
    <div className="space-y-6">
      <div className="flex w-full justify-between gap-3">
        <SegmentedControl.Root
          defaultValue="monitoring"
          onValueChange={(value) => setView(value as View)}
          value={view}
          className="w-[178px] text-ssm"
        >
          <SegmentedControl.Item value="monitoring">Monitoring</SegmentedControl.Item>
          <SegmentedControl.Item value="instance">Instance</SegmentedControl.Item>
        </SegmentedControl.Root>
        {view === 'monitoring' && (
          <div className="flex gap-3">
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
        )}
      </div>
      {view === 'monitoring' && (
        <>
          <Section
            className={clsx(
              'grid grid-cols-1 gap-4',
              hasPublicPort ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
            )}
          >
            <CardInstanceStatus clusterId={environment.cluster_id} serviceId={applicationId} />
            <CardInstance clusterId={environment.cluster_id} serviceId={applicationId} />
            <CardLogErrors
              organizationId={environment.organization.id}
              projectId={environment.project.id}
              environmentId={environment.id}
              serviceId={applicationId}
              clusterId={environment.cluster_id}
            />
            {hasStorage && <CardStorage clusterId={environment.cluster_id} serviceId={applicationId} />}
            {hasPublicPort && <CardHTTPErrors clusterId={environment.cluster_id} serviceId={applicationId} />}
            <CardPercentile50 clusterId={environment.cluster_id} serviceId={applicationId} />
            <CardPercentile95 clusterId={environment.cluster_id} serviceId={applicationId} />
            <CardPercentile99 clusterId={environment.cluster_id} serviceId={applicationId} />
          </Section>
          <Section className="overflow-hidden rounded border border-neutral-250">
            <div className="flex h-9 items-center bg-neutral-100 text-sm">
              <ToggleGroupPrimitive.Root
                type="single"
                defaultValue="global"
                value={chartView}
                onValueChange={(value) => value && setChartView(value as ChartView)}
                className="h-full"
              >
                <ToggleGroupPrimitive.Item
                  value="global"
                  className="h-full border-b border-r border-neutral-250 px-3 text-neutral-350 data-[state=on]:border-b-transparent data-[state=on]:bg-neutral-50 data-[state=on]:text-neutral-400"
                >
                  Global
                </ToggleGroupPrimitive.Item>
                <ToggleGroupPrimitive.Item
                  value="network"
                  className="h-full border-b border-r border-neutral-250 px-3 text-neutral-350 data-[state=on]:border-b-transparent data-[state=on]:bg-neutral-50 data-[state=on]:text-neutral-400"
                >
                  Network
                </ToggleGroupPrimitive.Item>
              </ToggleGroupPrimitive.Root>
              <div className="flex h-full flex-1 items-center justify-end gap-2 border-b border-neutral-250 px-5">
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
            <div className={clsx('grid', expandCharts ? 'grid-cols-1 divide-y divide-neutral-250' : 'grid-cols-2')}>
              {chartView === 'global' ? (
                <>
                  <div
                    className={clsx(
                      !expandCharts && 'border-b border-r border-neutral-250',
                      !hasStorage && 'border-b-0'
                    )}
                  >
                    <CpuChart clusterId={environment.cluster_id} serviceId={applicationId} />
                  </div>
                  <div className={clsx(!expandCharts && hasStorage && 'border-b border-neutral-250')}>
                    <MemoryChart clusterId={environment.cluster_id} serviceId={applicationId} />
                  </div>
                  {hasStorage && (
                    <>
                      <div className={clsx(!expandCharts && 'border-r border-neutral-250')}>
                        <DiskChart clusterId={environment.cluster_id} serviceId={applicationId} />
                      </div>
                      {!expandCharts && <div className="h-full w-full bg-neutral-100" />}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className={clsx(!expandCharts && 'border-b border-neutral-250')}>
                    <NetworkRequestStatusChart clusterId={environment.cluster_id} serviceId={applicationId} />
                  </div>
                  <div className={clsx(!expandCharts && 'border-b border-l border-neutral-250')}>
                    <NetworkRequestDurationChart clusterId={environment.cluster_id} serviceId={applicationId} />
                  </div>
                  <div className={clsx(!expandCharts && 'border-r border-neutral-250')}>
                    <NetworkRequestSizeChart clusterId={environment.cluster_id} serviceId={applicationId} />
                  </div>
                  {!expandCharts && <div className="h-full w-full bg-neutral-100" />}
                </>
              )}
            </div>
          </Section>
        </>
      )}
      {view === 'instance' && children}
    </div>
  )
}

export function ServiceOverview({ children }: PropsWithChildren) {
  return (
    <ServiceOverviewProvider>
      <ServiceOverviewContent>{children}</ServiceOverviewContent>
    </ServiceOverviewProvider>
  )
}

export default ServiceOverview
