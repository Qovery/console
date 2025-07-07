import clsx from 'clsx'
import { type PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useService } from '@qovery/domains/services/feature'
import { Checkbox, InputSelectSmall, Section, SegmentedControl } from '@qovery/shared/ui'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { CardHTTPErrors } from './card-http-errors/card-http-errors'
import { CardInstanceRestarts } from './card-instance-restart/card-instance-restarts'
import { CardInstance } from './card-instance/card-instance'
import { CardLogErrors } from './card-log-errors/card-log-errors'
import { CpuChart } from './cpu-chart/cpu-chart'
import { DiskChart } from './disk-chart/disk-chart'
import { MemoryChart } from './memory-chart/memory-chart'
import { SelectTimeRange } from './select-time-range/select-time-range'
import { ServiceOverviewProvider, useServiceOverviewContext } from './util-filter/service-overview-context'

type View = 'monitoring' | 'instance'

function ServiceOverviewContent({ children }: PropsWithChildren) {
  const { environmentId = '', applicationId = '' } = useParams()
  const [view, setView] = useState<View>('monitoring')

  const { data: service } = useService({ serviceId: applicationId })
  const { data: environment } = useEnvironment({ environmentId })
  const { expandCharts, useLocalTime, setUseLocalTime, hideEvents, setHideEvents, setExpandCharts } =
    useServiceOverviewContext()

  if (!environment || !service) return null

  const hasPublicPort =
    (service.serviceType === 'APPLICATION' && (service?.ports || []).some((port) => port.publicly_accessible)) ||
    (service.serviceType === 'CONTAINER' && (service?.ports || []).some((port) => port.publicly_accessible))

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
            <CardInstanceRestarts clusterId={environment.cluster_id} serviceId={applicationId} />
            <CardInstance clusterId={environment.cluster_id} serviceId={applicationId} />
            <CardLogErrors clusterId={environment.cluster_id} serviceId={applicationId} />
            {hasPublicPort && <CardHTTPErrors clusterId={environment.cluster_id} serviceId={applicationId} />}
          </Section>
          <Section className={clsx('rounded border border-neutral-200', expandCharts ? 'border-b-0' : '')}>
            <div className="flex h-12 w-full items-center justify-end gap-5 border-b border-neutral-200 px-5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hide-events"
                  name="hide-events"
                  className="h-4 w-4 min-w-4"
                  checked={hideEvents}
                  onCheckedChange={(checked) => setHideEvents(checked as boolean)}
                />
                <label htmlFor="hide-events" className="text-sm text-neutral-400">
                  Hide events
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="expand-charts"
                  name="expand-charts"
                  className="h-4 w-4 min-w-4"
                  checked={expandCharts}
                  onCheckedChange={(checked) => setExpandCharts(checked as boolean)}
                />
                <label htmlFor="expand-charts" className="text-sm text-neutral-400">
                  Expand charts
                </label>
              </div>
            </div>
            <div className={clsx('grid', expandCharts ? 'grid-cols-1 divide-y divide-neutral-200' : 'grid-cols-2')}>
              <div className={clsx(expandCharts ? '' : 'border-b border-r border-neutral-200')}>
                <CpuChart clusterId={environment.cluster_id} serviceId={applicationId} />
              </div>
              <div className={clsx(expandCharts ? '' : 'border-b border-neutral-200')}>
                <MemoryChart clusterId={environment.cluster_id} serviceId={applicationId} />
              </div>
              <div className={clsx(expandCharts ? 'border-b-transparent' : 'border-r border-neutral-200')}>
                <DiskChart clusterId={environment.cluster_id} serviceId={applicationId} />
              </div>
              <div />
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
