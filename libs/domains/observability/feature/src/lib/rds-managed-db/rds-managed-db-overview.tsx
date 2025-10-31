import clsx from 'clsx'
import { useParams } from 'react-router-dom'
import { type Database } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { Button, Callout, Chart, Heading, Icon, InputSelectSmall, Section, Tooltip } from '@qovery/shared/ui'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { CardAvailableRam } from '../rds-cards/card-available-ram/card-available-ram'
import { CardAvgCpuUtilization } from '../rds-cards/card-avg-cpu-utilization/card-avg-cpu-utilization'
import { CardAvgDbConnections } from '../rds-cards/card-avg-db-connections/card-avg-db-connections'
import { CardUnvacuumedTransactions } from '../rds-cards/card-unvacuumed-transactions/card-unvacuumed-transactions'
import { RdsCpuChart } from '../rds-charts/rds-cpu-chart/rds-cpu-chart'
import { RdsDiskQueueDepthChart } from '../rds-charts/rds-disk-queue-depth-chart/rds-disk-queue-depth-chart'
import { RdsRamChart } from '../rds-charts/rds-ram-chart/rds-ram-chart'
import { SelectTimeRange } from './select-time-range/select-time-range'
import { RdsManagedDbProvider, useRdsManagedDbContext } from './util-filter/rds-managed-db-context'
import { generateDbInstance } from './util/generate-db-instance'

function RdsManagedDbOverviewContent() {
  const { environmentId = '', databaseId = '' } = useParams()

  const { data: service } = useService({ serviceId: databaseId })
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
  } = useRdsManagedDbContext()

  if (!environment || !service)
    return (
      <div className="flex h-full w-full items-center justify-center p-5">
        <Chart.Loader />
      </div>
    )

  // Generate the RDS database instance identifier
  const dbInstance = generateDbInstance(service as Database)

  return (
    <div className="isolate">
      <div className="sticky top-16 z-10 flex h-[68px] w-full items-center justify-between gap-3 border-b border-neutral-250 bg-white px-8">
        <div className="flex gap-3">
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
              className={clsx('gap-1.5', isLiveUpdateEnabled && 'border border-transparent')}
              onClick={() => {
                if (!isLiveUpdateEnabled) {
                  if (timeRange !== '5m' && timeRange !== '15m' && timeRange !== '30m' && timeRange !== '1h') {
                    handleTimeRangeChange('15m')
                  }
                }
                setIsLiveUpdateEnabled(!isLiveUpdateEnabled)
              }}
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
          <Heading weight="medium">Overview</Heading>
          <div className={clsx('grid h-full gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4')}>
            <CardUnvacuumedTransactions clusterId={environment.cluster_id} dbInstance={dbInstance} />
            <CardAvgDbConnections clusterId={environment.cluster_id} dbInstance={dbInstance} />
            <CardAvgCpuUtilization clusterId={environment.cluster_id} dbInstance={dbInstance} />
            <CardAvailableRam clusterId={environment.cluster_id} dbInstance={dbInstance} />
          </div>
        </Section>

        <Section className="gap-4">
          <Heading weight="medium">Resources</Heading>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2')}>
            <div className="overflow-hidden rounded border border-neutral-250">
              <RdsCpuChart clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
            <div className="overflow-hidden rounded border border-neutral-250">
              <RdsRamChart clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
            <div className="overflow-hidden rounded border border-neutral-250">
              <RdsDiskQueueDepthChart clusterId={environment.cluster_id} dbInstance={dbInstance} />
            </div>
          </div>
        </Section>

        <Section className="gap-4">
          <Heading weight="medium">Storage & IOPS</Heading>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2')}>
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Storage & IOPS Metrics</Callout.TextHeading>
                <Callout.TextDescription>
                  Storage usage, IOPS, and throughput metrics will be displayed here.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          </div>
        </Section>

        <Section className="gap-4">
          <Heading weight="medium">Network</Heading>
          <div className={clsx('grid gap-3', expandCharts ? 'grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2')}>
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Network Metrics</Callout.TextHeading>
                <Callout.TextDescription>
                  Network throughput and connection metrics will be available here.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          </div>
        </Section>
      </div>
    </div>
  )
}

export function RdsManagedDbOverview() {
  return (
    <RdsManagedDbProvider>
      <RdsManagedDbOverviewContent />
    </RdsManagedDbProvider>
  )
}

export default RdsManagedDbOverview
